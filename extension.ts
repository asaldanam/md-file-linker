import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

  const provider = vscode.languages.registerCompletionItemProvider(
    { language: 'markdown', scheme: 'file' },
    {
      async provideCompletionItems(document, position) {
        const lineText = document.lineAt(position).text;
        const charBefore = lineText[position.character - 1];
        if (charBefore !== '@') {
          return undefined;
        }

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        if (!workspaceFolder) {
          return undefined;
        }

        const workspaceRoot = workspaceFolder.uri.fsPath;
        const EXCLUDE = '{**/node_modules/**,**/.git/**,**/dist/**,**/out/**,**/.next/**}';

        // Collect files
        const fileUris = await vscode.workspace.findFiles('**/*', EXCLUDE);

        // Collect unique directories from those file paths
        const dirSet = new Set<string>();
        for (const file of fileUris) {
          let dir = path.dirname(path.relative(workspaceRoot, file.fsPath));
          while (dir && dir !== '.' && dir !== '/') {
            dirSet.add(dir);
            dir = path.dirname(dir);
          }
        }

        const atRange = new vscode.Range(position.translate(0, -1), position);
        const items: vscode.CompletionItem[] = [];

        // File items
        for (const file of fileUris) {
          const relativePath = path.relative(workspaceRoot, file.fsPath);
          const fileName = path.basename(file.fsPath);
          const mdLink = `[${fileName}](/${relativePath})`;

          const item = new vscode.CompletionItem(relativePath, vscode.CompletionItemKind.File);
          item.detail = 'File';
          item.filterText = `@${fileName} ${relativePath}`;
          item.insertText = mdLink;
          item.additionalTextEdits = [vscode.TextEdit.delete(atRange)];
          items.push(item);
        }

        // Directory items
        for (const dir of dirSet) {
          const dirName = path.basename(dir);
          const mdLink = `[${dirName}](/${dir})`;

          const item = new vscode.CompletionItem(dir, vscode.CompletionItemKind.Folder);
          item.detail = 'Directory';
          item.filterText = `@${dirName} ${dir}`;
          item.insertText = mdLink;
          item.additionalTextEdits = [vscode.TextEdit.delete(atRange)];
          items.push(item);
        }

        return items;
      }
    },
    '@'
  );

  context.subscriptions.push(provider);
}

export function deactivate() {}
