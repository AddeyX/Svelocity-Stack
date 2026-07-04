# Svelocity Stack — Risk Register (V1)

**Status:** Active
**Owner:** Emmanuel Addey (solo maintainer — owner of all risks below; column records the guarding mechanism)

| #   | Risk                                                                     | Impact                              | Mitigation                                                                                                                  | Guard                                 |
| --- | ------------------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 1   | Scope explosion (shadcn option, Better Auth option, full CLI creep)      | v1 never ships                      | `V1-SCOPE.md` non-goals list is contractual; new ideas go to `V1.1-BACKLOG.md`, not the tree                                | Phase 0 doc + PR review against scope |
| 2   | Template rot (deps drift, template stops building)                       | Users get broken starter            | Golden-path CI runs install → check → build for all workspaces on every PR; catalog pins versions                           | Phase 8 CI                            |
| 3   | Native tooling friction (Xcode/Android SDK missing or mismatched)        | Mobile phase stalls adopters        | `svelocity doctor` checks toolchain; docs list exact prerequisites; mobile compile is documented-manual, not CI-gated in v1 | Phase 6 doctor + Phase 9 docs         |
| 4   | Cross-platform abstraction leaks (business logic drifts into app shells) | Triple maintenance, demo divergence | Dependency-direction rule in `CONVENTIONS.md`; code review checks apps stay thin; app-core owns all logic                   | Conventions + review                  |
| 5   | Convex Auth in Electron/Capacitor WebViews (storage/cookie quirks)       | Auth breaks off-web                 | Token storage via localStorage-compatible flow (proven in Cairno); platform smoke tests in Phases 4–5; caveats documented   | Phase 4/5 verification                |
| 6   | Solo-maintainer bus factor                                               | Stalled project                     | Everything documented in-repo; phases independently completable; AI skills encode repo rules                                | Phase 7 + docs                        |
| 7   | Upstream breaking changes (Svelte, Convex, Bits UI majors)               | Template breaks on install          | Catalog pins exact versions; COMPATIBILITY.md records tested matrix; bumps happen deliberately with CI proof                | Catalog + CI                          |
