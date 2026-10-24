import json
from pathlib import Path

import osmium


DOSSIER = Path(__file__).resolve().parent
ENTREE = DOSSIER / "quebec-latest.osm.pbf"
SORTIE = DOSSIER / "commerces-repentigny-auto.json"

ACTIVITES = {
    "restaurant", "cafe", "fast_food", "dentist",
    "doctors", "clinic", "veterinary", "pharmacy",
    "bank", "fuel", "car_wash"
}


class Collecteur(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.commerces = []
        self.sans_adresse = 0

    def examiner(self, objet, type_osm):
        tags = objet.tags

        ville = tags.get("addr:city", "").strip().casefold()

        if ville not in {
            "repentigny",
            "le gardeur",
            "repentigny (le gardeur)"
        }:
            return

        nom = tags.get("name", "").strip()

        if not nom:
            return

        activite = (
            tags.get("shop")
            or tags.get("craft")
            or tags.get("office")
            or tags.get("healthcare")
        )

        if not activite:
            amenity = tags.get("amenity", "")
            if amenity not in ACTIVITES:
                return
            activite = amenity

        numero = tags.get("addr:housenumber", "").strip()
        rue = tags.get("addr:street", "").strip()

        if not numero or not rue:
            self.sans_adresse += 1
            return

        self.commerces.append({
            "identifiantOSM": f"{type_osm}-{objet.id}",
            "nom": nom,
            "adresse": f"{numero} {rue}",
            "ville": "Repentigny",
            "codePostal": tags.get("addr:postcode") or None,
            "telephone": (
                tags.get("contact:phone")
                or tags.get("phone")
                or None
            ),
            "siteWeb": (
                tags.get("contact:website")
                or tags.get("website")
                or None
            ),
            "brute_info": (
                f"Type indiqué dans OpenStreetMap : {activite}."
            ),
            "source": (
                f"https://www.openstreetmap.org/{type_osm}/{objet.id}"
            ),
            "attribution": "© OpenStreetMap contributors",
            "licence": "https://www.openstreetmap.org/copyright",
            "aVerifier": True
        })

    def node(self, objet):
        self.examiner(objet, "node")

    def way(self, objet):
        self.examiner(objet, "way")

    def relation(self, objet):
        self.examiner(objet, "relation")


def main():
    if not ENTREE.is_file():
        raise FileNotFoundError(f"Fichier introuvable : {ENTREE}")

    print("Lecture du Québec en cours…", flush=True)

    collecteur = Collecteur()
    collecteur.apply_file(str(ENTREE))

    if not collecteur.commerces:
        raise RuntimeError(
            "Aucun commerce trouvé. Aucun fichier remplacé."
        )

    temporaire = SORTIE.with_suffix(".json.tmp")
    temporaire.write_text(
        json.dumps(
            collecteur.commerces,
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )
    temporaire.replace(SORTIE)

    print(f"{len(collecteur.commerces)} fiches extraites.")
    print(
        f"{collecteur.sans_adresse} lieux ignorés : "
        "adresse incomplète."
    )
    print(f"Fichier créé : {SORTIE.name}")


if __name__ == "__main__":
    try:
        main()
    except Exception as erreur:
        print(f"Échec : {erreur}")
        raise SystemExit(1)