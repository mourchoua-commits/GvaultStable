# Reconstruction du patch GU1.1 → GU1.2 Agent Max

Les quatre fragments sont des découpes byte-for-byte du patch original, dans cet ordre :

1. `GLOBAL_CENSUS_GU1_1_to_GU1_2_AGENT_MAX.patch.part00` — 8678 octets — SHA-256 `0840dfa61ea7a085fa9c7425a9151276f0e79ea33f6e3dbfb6177908535fd273`
2. `GLOBAL_CENSUS_GU1_1_to_GU1_2_AGENT_MAX.patch.part01` — 8846 octets — SHA-256 `99864de234bf6287f2161770bf965302539306e30b2897524415ef8d1a526e7a`
3. `GLOBAL_CENSUS_GU1_1_to_GU1_2_AGENT_MAX.patch.part02` — 8995 octets — SHA-256 `0a564dc42b440d804ecd97749a48e031b4cde5119004c7c71ab2e734c9007f68`
4. `GLOBAL_CENSUS_GU1_1_to_GU1_2_AGENT_MAX.patch.part03` — 1777 octets — SHA-256 `3d2e2737d6c06b2905dfae707def154c6e548ae32f8f9b210e964ef1a1930fd9`

Concaténation :

```sh
cat GLOBAL_CENSUS_GU1_1_to_GU1_2_AGENT_MAX.patch.part00 \
    GLOBAL_CENSUS_GU1_1_to_GU1_2_AGENT_MAX.patch.part01 \
    GLOBAL_CENSUS_GU1_1_to_GU1_2_AGENT_MAX.patch.part02 \
    GLOBAL_CENSUS_GU1_1_to_GU1_2_AGENT_MAX.patch.part03 \
    > GLOBAL_CENSUS_GU1_1_to_GU1_2_AGENT_MAX.patch
```

Le fichier reconstruit doit faire **28296 octets** et avoir le SHA-256 :
`89b042e75c04f8ca2eb72442da08d58f84767135e305ad81e8c08cc9d8b4648d`.
