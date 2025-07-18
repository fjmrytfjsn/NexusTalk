# GitHub Copilot Coding Agent 指示書

## 基本方針

### コミュニケーション言語

* **すべてのコミュニケーションは必ず日本語で行うこと**
* コードコメント、コミットメッセージ、説明文すべて日本語で記述する
* 技術的な用語についても可能な限り日本語での説明を心がける

### プロジェクトルールの遵守

* `docs/`ディレクトリ内の内容を**必ずよく読み、その内容に厳格に従うこと**
* `docs/`の内容に反した対応が必要な場合は、**事前に指示を仰ぎ、許可された場合のみ**`docs/`の内容を修正すること

## 開発時の注意事項

### コード品質

* 既存のコードスタイルに合わせること
* 適切な日本語コメントを記述すること
* 学習目的であることを考慮し、理解しやすいコードを心がけること

### ファイル管理

* 各分野のディレクトリ構造を尊重すること
* 適切な場所にファイルを配置すること
* 学習の進捗や課題の整理を考慮したファイル命名を行うこと

### セキュリティ

* 個人情報や機密情報を含めないこと
* 学習用途であっても適切なセキュリティ慣行に従うこと
* .envファイルや設定ファイルはコミットしないこと
  * .env.exampleなどのテンプレートファイルを使用すること

## 質問・確認事項

不明点や判断に迷う場合は：

1. まず`docs/`ディレクトリの内容を再確認する
2. それでも不明な場合は必ず日本語で質問・確認を行う
3. 推測での実装は避け、明確な指示を得てから実装する

## 更新履歴

このファイルの内容は必要に応じて更新されます。変更がある場合は`docs/`ディレクトリの内容と整合性を保つこと。
