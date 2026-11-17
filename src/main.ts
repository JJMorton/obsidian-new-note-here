import {
	Plugin,
	moment,
    DataWriteOptions,
    TFile,
    Notice,
    TFolder,
    SuggestModal,
    App,
    FuzzySuggestModal,
    FuzzyMatch,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	NewNoteHereSettings,
	NewNoteHereSettingTab,
} from './settings';


class NoteCreator {

	constructor(
		public app: App,
		public nameTemplate: string,
		public dateTemplate: string,
		public timeTemplate: string
	) {}

	createNoteIn(folder: TFolder, openAfter: boolean = false) {
		const date = moment().format(this.dateTemplate);
		const time = moment().format(this.timeTemplate);
		const name = this.nameTemplate
		.replace("{{date}}", date)
		.replace("{{time}}", time);
		const path = `${folder.path}/${name}.md`;

		this.createIfNotExists(path, "").then(f => {
			if (openAfter) void this.app.workspace.getLeaf().openFile(f);
		}).catch(console.error);
	}

	async createIfNotExists(path: string, data: string, options?: DataWriteOptions): Promise<TFile> {
		const f = this.app.vault.getFileByPath(path)
		if (f) {
			new Notice("Note already exists!");
			return f;
		}
		return await this.app.vault.create(path, data, options);
	}

}

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

		const creator = new NoteCreator(
			this.app,
			this.settings.nameTemplate,
			this.settings.dateTemplate,
			this.settings.timeTemplate,
		);

		const folderSelectModal = this.settings.fuzzyFolderSearch
			? new FuzzyCreateInFolderModal(this.app, creator)
			: new CreateInFolderModal(this.app, creator);

		this.addCommand({
			id: "create-here",
			name: "Create note here",
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

		this.addCommand({
			id: "create-in",
			name: "Create note in folder",
			callback: () => folderSelectModal.open(),
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

export class CreateInFolderModal extends SuggestModal<TFolder> {

	creator: NoteCreator;

	constructor(app: App, creator: NoteCreator) {
		super(app);
		this.creator = creator;
	}

	getSuggestions(query: string): TFolder[] | Promise<TFolder[]> {
		return this.app.vault.getAllFolders(true).filter(f =>
			f.name.toLowerCase().includes(query.toLowerCase())
		);
	}

	renderSuggestion(value: TFolder, el: HTMLElement): void {
	    el.createDiv({ text: value.name });
	    el.createEl("small", { text: value.path, cls: "suggestion-subtitle" });

	}

	onChooseSuggestion(folder: TFolder, _: MouseEvent | KeyboardEvent): void {
		this.creator.createNoteIn(folder, true);
	}
}

export class FuzzyCreateInFolderModal extends FuzzySuggestModal<TFolder> {

	creator: NoteCreator;

	constructor(app: App, creator: NoteCreator) {
		super(app);
		this.creator = creator;
	}

	getItems(): TFolder[] {
	    return this.app.vault.getAllFolders(true);
	}

	getItemText(folder: TFolder): string {
	    return folder.name;
	}

	renderSuggestion(item: FuzzyMatch<TFolder>, el: HTMLElement): void {
	    el.createDiv({ text: item.item.name });
	    el.createEl("small", { text: item.item.path, cls: "suggestion-subtitle" });
	}

	onChooseItem(folder: TFolder, _: MouseEvent | KeyboardEvent): void {
		this.creator.createNoteIn(folder, true);
	}

}
