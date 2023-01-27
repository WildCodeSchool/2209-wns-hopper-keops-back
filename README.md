# 2209-wns-hopper-keops-back

For launch the test =>

1.  Open a new terminal in vscode enter "docker compose -f docker-compose.test.yml up"
2.  your DB is lauched on your computer
3.  open a new terminal in vscode enter "npm test ./tests"

For Lauch the back =>

1.  Open a new terminal in vscode enter "docker compose up --build"

For merge tow branchs =>

1.  Ouvrir un terminal
2.  Rester sur la branch qu'on pull request "git checkout authentication"
3.  Mettre à jour toute les autres branches avec "git fetch --all
4.  Merge la branch d'arrivée sur la branch en cours "git merge dev"
5.  Si il y a des conflits les resoudre dans vscode sauf pour le packge-lock.json que l'on peut supprimer
6.  Si on a supprimé le package-lock.json, on le recréer avec un "nmp i" ou "yarn i"
7.  Afficher le status des changement actuellement pris en compte avec "git status"
8.  Pour ajouter les élement non chargé dans la pull request entrer "git add -A"
9.  Revérifier le status des changement actuellement pris en compte avec "git status", tout doit être en vert
10. Commmit tout les changement chargé avec "git commit -m 'le message'"
11. Synchroniser le repository avec "git push"
