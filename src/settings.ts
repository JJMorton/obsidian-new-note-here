import { App, PluginSettingTab, Setting } from 'obsidian';
import NewNoteHerePlugin from './main';

export interface NewNoteHereSettings {
	nameTemplate: string;
	dateTemplate: string;
	timeTemplate: string;
	fuzzyFolderSearch: boolean;
}

export const DEFAULT_SETTINGS: NewNoteHereSettings = {
	nameTemplate: "{{date}} Untitled",
	dateTemplate: "YYYY-MM-DD",
	timeTemplate: "HH:mm",
	fuzzyFolderSearch: true,
};

export class NewNoteHereSettingTab extends PluginSettingTab {
	plugin: NewNoteHerePlugin;

	constructor(app: App, plugin: NewNoteHerePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions() {
		return [
			{
				name: "Name format",
				desc: "Choose how new notes are named in your vault.",
				control: {
					type: "text",
					key: "nameTemplate",
					placeholder: DEFAULT_SETTINGS.nameTemplate,
				}
			},
			{
				name: "Date format",
				desc: "{{date}} in the name format will be replaced with this value.",
				control: {
					type: "text",
					key: "dateTemplate",
					placeholder: DEFAULT_SETTINGS.dateTemplate,
				}
			},
			{
				name: "Time format",
				desc: "{{time}} in the name format will be replaced with this value.",
				control: {
					type: "text",
					key: "timeTemplate",
					placeholder: DEFAULT_SETTINGS.timeTemplate,
				}
			},
			{
				name: "Fuzzy folder search",
				desc: "Use fuzzy matching when searching folders",
				control: {
					type: "toggle",
					key: "fuzzyFolderSearch",
				}
			}
		]
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Name format")
			.setDesc("Choose how new notes are named in your vault.")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.nameTemplate)
					.setValue(this.plugin.settings.nameTemplate)
					.onChange(async (value) => {
						this.plugin.settings.nameTemplate = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Date format")
			.setDesc("{{date}} in the name format will be replaced with this value.")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.dateTemplate)
					.setValue(this.plugin.settings.dateTemplate)
					.onChange(async (value) => {
						this.plugin.settings.dateTemplate = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Time format")
			.setDesc("{{time}} in the name format will be replaced with this value.")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.timeTemplate)
					.setValue(this.plugin.settings.timeTemplate)
					.onChange(async (value) => {
						this.plugin.settings.timeTemplate = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Fuzzy folder search")
			.setDesc("Use fuzzy matching when searching folders")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.fuzzyFolderSearch)
				.onChange(async value => {
					this.plugin.settings.fuzzyFolderSearch = value;
					await this.plugin.saveSettings();
					this.display();
				})
			)

	}
}
