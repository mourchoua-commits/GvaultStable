# GAME VAULT GU1.1 — ROLLBACK

Base conservée :
- `GAME_VAULT_v67_VFS_ALPHA4_9_GLOBAL_CENSUS_GU1_SOURCE.html` — SHA-256 `316a789441413e708d2fb02bb2aadd184e82d36e7c09258343eac5bdef6ef56d`
- `GAME_VAULT_v67_VFS_ALPHA4_9_QA_HARDENED_PHONE_LOCK.html` — SHA-256 `6d2c5c1198a6027cbda9cd355ac97fd74e15073048d7537de6adaa2fdbce9ffe`

Candidate GU1.1 :
- `GAME_VAULT_v67_VFS_ALPHA4_9_GLOBAL_CENSUS_GU1_1_CHECKUP_REPAIR_SOURCE.html` — SHA-256 `57665decafa76efdb1d2905b0ef9d45e56fd9fbf1528147a49ae7ecd284c957f`
- `GAME_VAULT_v67_VFS_ALPHA4_9_GLOBAL_CENSUS_GU1_1_CHECKUP_REPAIR_PHONE_LOCK.html` — SHA-256 `89f1df03b5c390aa6d641b3706d5a012e739c94695f63352f9d44a4cc0643646`

Le wrapper de verrouillage est byte-identique à l'ancien en dehors du payload gzip `gv-current-payload`. Le sas / secret existant n'a pas été modifié.

Pour revenir à GU1, restaurer la paire Base ci-dessus.
