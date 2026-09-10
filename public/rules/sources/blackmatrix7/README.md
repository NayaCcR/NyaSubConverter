# Public routing rule snapshot

Original author/project: [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script).

Retrieved at: 2026-09-10T20:54:43.030Z. Pinned revision: [4112f8e7b3a9f23c9ccf381beaa5931a36df3781](https://github.com/blackmatrix7/ios_rule_script/tree/4112f8e7b3a9f23c9ccf381beaa5931a36df3781).

The files in `rules/` are unmodified upstream source files, including their author and update notices. The upstream GPL version 2 license is retained in [LICENSE](LICENSE). These rule data retain their upstream license.

NyaSub's adapted data in `web/src/lib/rules-data/app-routing-snapshot.json` adds a routing policy to each supported basic rule. Unsupported IP-ASN entries are recorded in its `omitted` metadata instead of silently discarded. The adaptation was generated on 2026-09-10T20:54:43.030Z; it is a static snapshot and does not update automatically. NyaSub adds its own private-network and mainland-IP fallback rules separately.

Rebuild this exact source revision with:

```sh
node scripts/update-rule-presets.mjs --ref 4112f8e7b3a9f23c9ccf381beaa5931a36df3781
```

Omit `--ref` to retrieve the upstream master revision at update time. Review the diff, omissions, upstream timestamps, and license before rebuilding the frontend. Saved database templates are not changed by this command.
