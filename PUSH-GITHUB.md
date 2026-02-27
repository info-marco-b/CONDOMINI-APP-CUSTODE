# Push su GitHub - APP-CUSTODE

## 1. Crea il repository su GitHub

1. Vai su **https://github.com/new**
2. **Repository name:** `APP-CUSTODE` (o un nome a piacere)
3. **Descrizione:** opzionale (es. "App Custode Condominiale")
4. Scegli **Public** o **Private**
5. **Non** spuntare "Add a README", ".gitignore" o "license" (il progetto li ha già)
6. Clicca **Create repository**

## 2. Collega e push da PowerShell

Dopo aver creato il repo, GitHub mostrerà l’URL. Sostituisci `TUO-USERNAME` con il tuo username GitHub ed esegui:

```powershell
cd "c:\Users\infom\Documents\MIEI FILE\SVILUPPO\CONDOMINI\APP-CUSTODE"
git remote add origin https://github.com/TUO-USERNAME/APP-CUSTODE.git
git branch -M main
git push -u origin main
```

Se GitHub ti chiede credenziali, usa un **Personal Access Token** (non la password):  
Impostazioni account → Developer settings → Personal access tokens → Generate new token.

---

Quando hai creato il repo e conosci l’URL esatto, puoi incollarlo qui e ti indico i comandi precisi (o li eseguo io se preferisci).
