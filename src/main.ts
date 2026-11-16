import {
	Plugin,
	moment,
    DataWriteOptions,
    TFile,
    Notice,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	NewNoteHereSettings,
	NewNoteHereSettingTab,
} from './settings';


export default class NewNoteHerePlugin extends Plugin {
	settings!: NewNoteHereSettings;

	async createIfNotExists(path: string, data: string, options?: DataWriteOptions): Promise<TFile> {
		const f = this.app.vault.getFileByPath(path)
		if (f) {
			new Notice("Note already exists!");
			return f;
		}
		return await this.app.vault.create(path, data, options);
	}

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "create",
			name: "Create note",
			checkCallback: (checking: boolean) => {
				const active = this.app.workspace.getActiveFile()
				if (!active) return false;
				if (!checking) {
					const dir = active.parent || active.vault.getRoot();
					const date = moment().format(this.settings.dateTemplate);
					const time = moment().format(this.settings.timeTemplate);
					const name = this.settings.nameTemplate
						.replace("{{date}}", date)
						.replace("{{time}}", time);
					const path = `${dir.path}/${name}.md`;

					this.createIfNotExists(path, "").then(f => {
						void this.app.workspace.getLeaf().openFile(f);
					}).catch(console.error);
				}
				return true;
			},
		});

		this.addSettingTab(new NewNoteHereSettingTab(this.app, this));

	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<NewNoteHereSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
