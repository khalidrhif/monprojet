// ==========================================
// 1. ZONE ACCUEIL (S'exécute uniquement sur index.html)
// ==========================================
let texteVille = document.querySelector(".blue-location");

if (texteVille !== null) {
    // On force l'affichage de votre ville par défaut
    texteVille.innerText = "Repentigny, QC";

    // Détection du clic pour les tests de la console
    texteVille.addEventListener("click", function() {
        console.log("Le clic sur Repentigny fonctionne !");
    });
}

// ==========================================
// 2. ZONE FORMULAIRE (S'exécute uniquement sur join-pro.html)
// ==========================================
// A. Pré-remplissage automatique de l'indicatif régional local 450
let caseTelephone = document.getElementById("pro-phone");

if (caseTelephone !== null) {
    caseTelephone.value = "450-"; /* S'affiche tout seul à l'ouverture de la page */
}

// B. Gestion de la soumission du formulaire d'inscription
let boutonFormulairePro = document.getElementById("submit-pro-btn");

if (boutonFormulairePro !== null) {
    boutonFormulairePro.addEventListener("click", function() {
        // Récupération des valeurs tapées par le professionnel
        let metierSaisi = document.getElementById("pro-service").value;
        let telephoneSaisi = document.getElementById("pro-phone").value;
        
        console.log("Nouvelle inscription reçue !");
        console.log("Métier : " + metierSaisi);
        console.log("Téléphone : " + telephoneSaisi);

        // Transformation instantanée de la boîte en message de succès vert
        let boiteFormulaire = document.querySelector(".pro-form-box");
        
        if (boiteFormulaire !== null) {
            boiteFormulaire.innerHTML = `
                <h3 style="color: #2ecc71; text-align: center; margin-bottom: 10px;">✔️ Inscription réussie !</h3>
                <p style="text-align: center; color: #111e25;">Merci ! Votre profil de <strong>${metierSaisi}</strong> a bien été enregistré à Repentigny.</p>
            `;
        }
    });
}
