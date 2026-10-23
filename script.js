// ==========================================
// 1. ZONE ACCUEIL (S'exécute uniquement sur index.html)
// ==========================================
let texteVille = document.querySelector(".blue-location");

if (texteVille !== null) {
    texteVille.innerText = "Repentigny, QC";

    texteVille.addEventListener("click", function() {
        console.log("Le clic sur Repentigny fonctionne !");
    });
}

// ==========================================
// 2. ZONE FORMULAIRE (S'exécute uniquement sur join-pro.html)
// ==========================================
let boutonFormulairePro = document.getElementById("submit-pro-btn");

if (boutonFormulairePro !== null) {
    boutonFormulairePro.addEventListener("click", function() {
        let metierSaisi = document.getElementById("pro-service").value;
        let telephoneSaisi = document.getElementById("pro-phone").value;
        
        let boiteFormulaire = document.querySelector(".pro-form-box");
        
        if (boiteFormulaire !== null) {
            boiteFormulaire.innerHTML = `
                <h3 style="color: #2ecc71; text-align: center; margin-bottom: 10px;">✔️ Inscription réussie !</h3>
                <p style="text-align: center; color: #111e25;">Merci ! Votre profil de <strong>${metierSaisi}</strong> a bien été enregistré à Repentigny.</p>
            `;
        }
    });
}
