# Sync across desktop, laptop, and phone

The template supplies portable files, not a connected sync account. Choose one service to own live synchronization. [Obsidian's sync guide](https://obsidian.md/help/sync-notes) explains the platform-specific choices.

## Self-hosted LiveSync

[Self-hosted LiveSync](https://github.com/vrtmrz/obsidian-livesync) is the self-hosted option selected for this starter guide. My personal vault has LiveSync and Obsidian Git enabled, but that alone does not establish which devices are synchronized or whether backups run automatically. It requires a compatible backend and configuration on every device. The template includes no server address, account, encryption password, or setup URI.

1. Make a separate copy of the Vault folder for your personal notes and back it up.
2. Follow the project's current [setup documentation](https://github.com/vrtmrz/obsidian-livesync#how-to-use) to provision your backend and configure your first device. Set up encryption as described there.
3. Install the plugin on another device and use its documented setup process to connect that device to the same vault. Treat any generated setup URI as a secret.
4. Choose deliberately whether hidden settings and customization files are synchronized. Ensure the CSS snippets and dashboard artwork reach every device. Use the plugin's current customization-sync guidance rather than assuming all of `.obsidian` travels automatically.
5. In a sample note, test creating and editing from both devices, an offline edit followed by reconnecting, and a deletion. Confirm the expected files and conflict behavior before importing important notes.

## What needs to travel

| Content | Handling |
| --- | --- |
| Notes, templates, attachments | Sync as vault content |
| Dashboard note, JavaScript, artwork | Keep together so navigation and visuals work |
| CSS snippets and appearance settings | Include intentionally; hidden files may need separate configuration |
| Plugin installations and authentication | Check on each device; install and sign in locally as needed |
| Workspace layout, cache, timer state | Keep device-local |

Mobile storage and hidden-file handling differ by platform. Confirm the selected service supports your phone and open the actual vault in the mobile app. A desktop browser preview cannot establish that a mobile plugin works.

## Alternatives

My setup notes also consider Remotely Save, Syncthing, Git, and OneDrive or other cloud storage. These solve different parts of the problem: a live sync service, access to files, and recoverable history are separate choices.

- [Obsidian Sync](https://obsidian.md/sync): Obsidian's own service.
- [Remotely Save](https://github.com/remotely-save/remotely-save): synchronize using a supported storage provider.
- [Syncthing](https://syncthing.net/): file synchronization, with device-specific setup; see Obsidian's guide for mobile constraints.

Avoid running competing live sync services over the same vault. Check each project's current documentation for supported platforms and configuration.

OneDrive and other cloud folders depend on mobile-platform support and keeping files available offline. Check the [official platform guidance](https://obsidian.md/help/sync-notes) before choosing one for both a computer and phone.

## History and backups

My notes describe occasional Git pushes, not a proven automatic backup schedule. The workflow below is guidance for setting up and checking your own recovery process.

Sync propagates changes, including mistakes. Keep a separate backup that you can restore. Test recovering a sample deleted note from that backup.

[Obsidian Git](https://github.com/Vinzent03/obsidian-git) can provide version history in a **private** repository. Keep that separate from this public template. If LiveSync handles live edits, Git should have a deliberate backup workflow rather than a second automatic pull-and-merge loop over the same files. Exclude credentials and device state from backups intended for remote storage, and handle encryption keys separately.

The template's Git ignore rules omit installed plugins, sync configuration, themes, and workspace state. They do not make arbitrary personal notes safe to publish.
