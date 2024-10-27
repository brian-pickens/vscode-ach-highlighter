import * as vscode from 'vscode';
import { Record } from './record';


export function activate(context: vscode.ExtensionContext) {
	const fieldDecorationType = vscode.window.createTextEditorDecorationType({
		light: {
			// this color will be used in light color themes
			backgroundColor: 'darkGrey'
		},
		dark: {
			// this color will be used in dark color themes
			backgroundColor: 'lightGrey'
		}
	});

	let activeEditor = vscode.window.activeTextEditor;

    vscode.languages.registerHoverProvider('*', {
        provideHover(document, cursor, token) {

			const text = document.lineAt(cursor.line).text.substring(0, 94);
			const record = new Record(text);
			const selectedField = record.getField(cursor.character+1);
			if (selectedField === null) { return; }

			activeEditor?.setDecorations(fieldDecorationType, [new vscode.Range(new vscode.Position(cursor.line, selectedField.StartPosition), new vscode.Position(cursor.line, selectedField.EndPosition))]);
			return new vscode.Hover(new vscode.MarkdownString(selectedField?.Name));
        }
    });

}