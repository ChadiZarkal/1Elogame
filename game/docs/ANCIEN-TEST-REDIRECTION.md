# Rediriger l'ancien Red Flag Test

`redflagtest.redorgreen.fr` sert encore l'ancienne application (ProcessWire,
Apache). Google l'a indexée sous « Red or Green : LE test des Red Flags ! » :
elle se classe sur la requête que vise `redorgreen.fr/redflagtest`, et garde
pour elle l'ancienneté et les liens entrants qui devraient revenir au nouveau
test. Deux sites pour une marque, c'est aussi l'inverse de la « présence
cohérente sur le Web » que demande AdSense.

**Ce réglage ne peut pas se faire depuis ce dépôt** : il se pose chez
l'hébergeur de l'ancien site.

## La règle

En tête du fichier `.htaccess` à la racine de l'ancien site, **avant** les
règles de ProcessWire :

```apache
# Le Red Flag Test vit désormais sur redorgreen.fr/redflagtest.
# Redirection permanente de toutes les adresses de l'ancien site.
RewriteEngine On
RewriteCond %{HTTP_HOST} ^redflagtest\.redorgreen\.fr$ [NC]
RewriteRule ^ https://redorgreen.fr/redflagtest [R=301,L]
```

Toutes les adresses de l'ancien site, résultats partagés compris, mènent au
test. Les anciens résultats ne sont pas repris : ils n'existent pas dans la
nouvelle base.

## Vérifier

```bash
curl -sI https://redflagtest.redorgreen.fr/ | grep -i "^HTTP\|^location"
```

Attendu : `HTTP/1.1 301` et `Location: https://redorgreen.fr/redflagtest`.

Puis, dans la Search Console, sur la propriété de l'ancien sous-domaine si
elle existe : outil **Changement d'adresse** vers `redorgreen.fr`.

## À ne pas faire

- **Rediriger en 302** : c'est une redirection temporaire, Google garderait
  l'ancienne adresse dans son index.
- **Supprimer le site sans redirection** : les liens entrants tomberaient en
  erreur et leur valeur serait perdue.
- **Laisser les deux en ligne** : c'est la situation actuelle.
