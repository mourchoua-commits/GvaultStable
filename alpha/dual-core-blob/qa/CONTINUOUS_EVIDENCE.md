# Continuous dual-core blob soak — final evidence

- Run: 33698952863
- Status: PASS
- Mode: RUN_UNTIL_STOPPED
- Auto-start: true
- Worker model: TWO_PERSISTENT_WEB_WORKERS_FROM_BLOB_URLS
- Families: 12 / 12
- Observed cycles: 5972
- Dual-ready: 8344832 / 8344832
- Proof recoveries: 9960
- Watchdog restarts: 30
- Soft egress rejects: 5972
- Real late HTTP(S) network requests: 0
- Internal Blob worker loads: 58
- Console errors: 0
- History bound: 64
- Stop semantics: GRACEFUL_DRAIN_INFLIGHT
- External writes: NONE
- Canonical mutation: false
- Artifact: public-dual-core-continuous-playwright (ID 9872813753)
- Artifact SHA256: b67ab1cb234fd9ea6e41aa9db0d96f611115487634809e605d1f309ef20ead55

The blob engine itself has no internal end condition and auto-starts. Playwright stops only its finite verification instance after collecting sustained-run evidence. Draft PR only; no merge requested.
