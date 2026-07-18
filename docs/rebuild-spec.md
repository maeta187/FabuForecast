# FabuForecast リビルド仕様書

新リポジトリで FabuForecast を作り直すための要件・設計ドキュメント。
本書は現行リポジトリ(Next.js 13 単体構成)のコード調査と、技術選定の議論・調査の結果をまとめたもの。

- 作成日: 2026-07-18(同日更新: 天気APIを気象庁 JSON に変更し、地域切替機能を追加)
- ステータス: 確定(実装は新リポジトリで行う)

---

## 1. アプリ概要

**FabuForecast** は「天気予報(気温)を見ながら、日ごとの服装コーディネートを記録・管理する」Web アプリ。

ユーザーは居住地域(都道府県)を登録してアカウントを作成し、その地域の週間気温予報(最高/最低気温)を確認しながら、日付ごとに「アウター・トップス・ボトムス」を記録する。過去の記録を気温と紐付けて振り返れることが、単なる天気アプリとの差別化ポイント。

### 現行アプリの実装状況(移行元)

| 機能 | 状態 |
| --- | --- |
| 会員登録(ユーザーID/メール/都道府県/パスワード) | 実装済み |
| ログイン(NextAuth Credentials + JWT) | 実装済み |
| 週間気温予報の取得(Open-Meteo) | 実装済み(緯度経度がハードコード) |
| コーディネート入力 UI | 実装済み(保存 API が未実装) |
| コーディネート保存・閲覧・編集 | 未実装 |
| ログイン状態によるナビ出し分け | 未実装 |
| 都道府県マスタ | 3件のみ(東京/神奈川/広島) |

---

## 2. 決定事項(Decision Log)

| # | 項目 | 決定 | 理由 |
| --- | --- | --- | --- |
| 1 | 全体構成 | **pnpm workspace + Turborepo のモノレポ** | フロント/バック分離と型共有の両立 |
| 2 | フロントエンド | **Next.js(最新: 15系)+ React 19** | App Router 継続。作り直すため最新に刷新 |
| 3 | バックエンド | **Hono**(Node.js ランタイム前提) | 軽量・Web 標準・Hono RPC による end-to-end 型安全 |
| 4 | BaaS(Supabase 等) | **不採用** | 自前構成で学習・制御性を優先 |
| 5 | 認証 | **Better Auth** | email/password が第一級サポート。Hono 統合が公式。自前実装(ハッシュ化・セッション管理)を排除できる |
| 6 | ORM | **Drizzle**(Prisma から乗り換え) | 軽量・SQL 寄り・エッジ対応。Better Auth 公式サポートあり |
| 7 | DB | **PostgreSQL**(Docker Compose でローカル起動) | 現行踏襲 |
| 8 | CSS | **Tailwind CSS v4** | 現行 v3 から刷新 |
| 9 | UI ライブラリ | **shadcn/ui**(調査の上選定。§4 参照) | フォーム/トースト/ダイアログの完成度と拡張性 |
| 10 | バリデーション | **Zod**(フロント/バックで共有) | 現行踏襲。Hono の zValidator・RHF resolver 両対応 |
| 11 | テスト | **Vitest を導入** | 現行テストゼロからの改善 |
| 12 | Storybook | **見送り** | 規模に対して維持コストが高い |
| 13 | Husky + lint-staged | **見送り** | lint / format は手動実行 |
| 14 | CI(GitHub Actions) | **今回は見送り** | 後から追加可能 |
| 15 | 天気予報 API | **気象庁 JSON(bosai)** | 国内特化。府県予報区コードで取得でき地域選択の設計と直結。無料・出典明記で商用利用可(§9 参照) |
| 16 | Lint / Format | **oxlint + oxfmt(VoidZero / Oxc)** | Rust 製で高速。oxlint は 1.0 安定版、oxfmt は Prettier 互換(JS/TS 適合テスト100%)で Tailwind クラスソート内蔵 |
| 17 | 画像ストレージ | **S3 互換 API 前提(サービスは未定)** | コーデ写真(Should)の保存先。コードは S3 互換 SDK で書き、契約先(R2 / S3 等)は実装時に決定。ローカル開発は MinIO(Docker) |

---

## 3. 技術スタック

| 分類 | 技術 |
| --- | --- |
| モノレポ | pnpm workspace + Turborepo |
| フロントエンド | Next.js 15(App Router)/ React 19 / TypeScript |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| バックエンド | Hono 4 + @hono/node-server(Node.js) |
| 認証 | Better Auth(email/password、Drizzle アダプタ) |
| DB / ORM | PostgreSQL + Drizzle ORM + drizzle-kit |
| API 型共有 | Hono RPC(`hc<AppType>`) |
| バリデーション | Zod(共有パッケージ) |
| フォーム | React Hook Form + @hookform/resolvers |
| 外部 API | 気象庁 天気予報 JSON(API キー不要・出典明記で利用) |
| テスト | Vitest |
| Lint / Format | oxlint + oxfmt(Oxc ツールチェーン) |

---

## 4. UI ライブラリ選定(調査結果)

Tailwind v4 前提で shadcn/ui・daisyUI v5・HeroUI を比較調査した。

| 観点 | shadcn/ui | daisyUI v5 | HeroUI |
| --- | --- | --- | --- |
| 方式 | コンポーネントのソースをプロジェクトに取り込む(コード所有) | CSS クラスのみ(JS ゼロ) | 完成品 React コンポーネント |
| コンポーネント数 | 約44 | 約65 | 多い |
| カスタマイズ性 | ◎(コードを直接編集) | ○(クラス上書き) | △ |
| フォーム統合(RHF + Zod) | ◎(Form コンポーネントが公式パターン) | なし(自前) | ○ |
| アクセシビリティ | ◎(Radix ベース) | △(自前実装依存) | ◎ |
| 依存の重さ | 中(Radix 依存) | ゼロ | 重い |
| フレームワーク | React 専用 | 非依存 | React 専用 |

**結論: shadcn/ui を採用。**

- 本アプリの中心は「フォーム(会員登録・ログイン・コーデ入力)」と「トースト・ダイアログ」であり、RHF + Zod と統合された Form パターン、Radix ベースのアクセシブルな Select/Dialog/Toast(sonner)をそのまま使える shadcn/ui が最も要件に合う
- コード所有方式のためライブラリのバージョンアップに縛られず、モノレポでも `apps/web` 内で完結する
- daisyUI は JS ゼロで軽量だが、フォーム・トーストのロジックが結局自前になる。HeroUI は依存が重くカスタマイズの自由度が低い

参考: [daisyUI vs shadcn/ui](https://daisyui.com/compare/daisyui-vs-shadcn/) / [Best Tailwind CSS UI Libraries in 2026](https://stacknotice.com/blog/best-tailwind-ui-libraries-2026) / [DaisyUI vs Shadcn UI](https://windframe.dev/blog/daisyui-vs-shadcn-ui) / [10 Best Tailwind Component Libraries](https://spell.sh/blog/best-tailwind-component-libraries)

---

## 5. 機能要件

優先度: **Must**(初回リリース必須)/ **Should**(早期に追加)/ **Could**(将来候補)

### 5.1 認証・アカウント

| 機能 | 優先度 | 備考 |
| --- | --- | --- |
| 会員登録(メール+パスワード+ユーザー名+登録地域) | Must | Better Auth `signUp.email` + additionalFields で地域コードを保存 |
| ログイン / ログアウト | Must | Better Auth `signIn.email` / `signOut` |
| セッション管理・保護ページ | Must | DB セッション(Cookie)。未ログインは `/login` へ |
| アカウント設定(登録地域・ユーザー名・パスワード変更) | Should | Better Auth `updateUser` / `changePassword` |
| パスワードリセット(メール送信) | Could | メールプロバイダ(Resend 等)契約が前提 |
| メールアドレス検証 | Could | 同上 |
| アカウント削除 | Could | Better Auth 組み込み(deleteUser) |

### 5.2 天気予報

| 機能 | 優先度 | 備考 |
| --- | --- | --- |
| 登録地域の週間予報(最高/最低気温) | Must | 気象庁 JSON。ユーザーの登録地域コードで取得(現行のハードコードを解消) |
| 地域マスタ(気象庁 府県予報区) | Must | 現行3件 → 全国。コード内マスタ(表示名+気象庁地域コード)。北海道・沖縄などは気象庁の区分に合わせて細分(全56区分程度) |
| 表示地域の切替(一覧から選択) | Must | 予報画面のセレクタで任意の地域の予報を閲覧できる。登録地域はデフォルト表示地域として扱う |
| 天気アイコン(晴れ/曇り/雨) | Should | 気象庁 JSON の天気コードをアイコンにマッピング |
| 降水確率 | Should | 同じレスポンスに含まれるため追加リクエスト不要 |
| 出典表記(「出典: 気象庁ホームページ」) | Must | 政府標準利用規約の要件。予報表示部またはフッターに常時表示 |

### 5.3 コーディネート(中核機能)

| 機能 | 優先度 | 備考 |
| --- | --- | --- |
| 日付ごとのコーデ登録(アウター/トップス/ボトムス) | Must | 現行未実装の保存 API を含む。ユーザー×日付で一意(upsert) |
| 保存済みコーデの表示・編集 | Must | 予報画面に既存データを反映 |
| コーデの削除 | Should | 写真がある場合はストレージのオブジェクトも削除 |
| コーデ写真のアップロード(1日1枚) | Should | S3 互換ストレージに保存し DB にはオブジェクトキーのみ保持。5MB 程度・jpeg/png/webp に制限 |
| 過去コーデの履歴一覧 | Should | 記録アプリとしての価値。当日の気温・写真サムネイルも併記 |
| 「似た気温の日に何を着たか」参照 | Could | 差別化機能。予報気温 ±2℃ の過去記録を提示 |
| メモ・小物など項目追加 | Could | |

### 5.4 共通 UI

| 機能 | 優先度 | 備考 |
| --- | --- | --- |
| ランディングページ | Must | 現行のヒーローを刷新(仮テキスト排除) |
| ログイン状態によるナビ出し分け | Must | 現行 TODO の解消。`useSession` で切り替え |
| トースト通知 | Must | shadcn/ui(sonner) |
| レスポンシブ対応 | Must | モバイルはドロワーナビ |
| ダークモード | Could | |

---

## 6. 画面一覧

| パス | 画面 | 認証 | 優先度 |
| --- | --- | --- | --- |
| `/` | ランディング | 不要 | Must |
| `/signup` | 会員登録 | 不要 | Must |
| `/login` | ログイン | 不要 | Must |
| `/forecast` | 週間予報+コーデ入力(メイン画面)。地域切替セレクタ付き | 必要 | Must |
| `/history` | 過去コーデ履歴 | 必要 | Should |
| `/settings` | アカウント設定 | 必要 | Should |

> 現行の `/coordination/create` は `/forecast` に統合する(予報閲覧と入力を1画面に)。

### 入力バリデーション(現行仕様を踏襲)

| 項目 | ルール |
| --- | --- |
| ユーザー名(ユーザーID) | 必須 / 8文字以上 / 英数字のみ |
| メールアドレス | 必須 / メール形式 |
| 登録地域 | 必須 / 地域マスタ(気象庁 府県予報区)に存在するコード |
| パスワード | 必須 / 8〜20文字 / 小文字英字と数字を含む |
| パスワード確認 | パスワードと一致 |
| コーデ各項目 | 任意 / 最大50文字程度 |

エラーメッセージは日本語(現行文言を流用)。

---

## 7. アーキテクチャ / モノレポ構成

```
fabuforecast/
├── apps/
│   ├── web/                  # Next.js 15(フロントエンド)
│   │   ├── src/app/          # App Router(/, /signup, /login, /forecast, ...)
│   │   ├── src/components/   # shadcn/ui 取り込み先 + 独自コンポーネント
│   │   └── src/lib/          # auth-client, api-client(Hono RPC)
│   └── api/                  # Hono(バックエンド)
│       ├── src/auth.ts       # Better Auth インスタンス
│       ├── src/app.ts        # ルート定義(AppType をエクスポート)
│       ├── src/index.ts      # @hono/node-server エントリ
│       └── scripts/seed.ts   # シードスクリプト
├── packages/
│   ├── db/                   # Drizzle スキーマ + クライアント + drizzle-kit 設定
│   └── schema/               # Zod スキーマ / 地域マスタ(気象庁コード) / 共有型・整形ユーティリティ
├── docker-compose.yml        # PostgreSQL
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

### 通信経路

- ブラウザ → `apps/web`(:3000)→ **Next.js rewrites** で `/api/*` を `apps/api`(:3001)へプロキシ
  - 同一オリジンになるため CORS/Cookie の問題を回避
- `apps/web` は `hc<AppType>`(Hono RPC)で API を型安全に呼び出す
- Better Auth のエンドポイントは `/api/auth/*` にマウント(フロントは `better-auth/react` の `createAuthClient`)

---

## 8. データモデル(Drizzle / PostgreSQL)

認証系テーブル(user / session / account / verification)は **Better Auth CLI(`npx @better-auth/cli generate`)で生成**したものをベースにする。ポイントのみ記載:

```ts
// packages/db/src/schema.ts(概略)
export const user = pgTable('user', {
  id: text('id').primaryKey(),              // Better Auth が生成
  name: text('name').notNull(),             // ユーザー名(現行の userId 相当)
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  areaCode: text('area_code').notNull(),    // ★ additionalField: 気象庁地域コード(例 '130000' = 東京都)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

// session / account / verification は Better Auth CLI 生成のまま

export const coordinate = pgTable(
  'coordinate',
  {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),           // ★ 現行モデルに無かった日付カラムを追加
    outerwear: text('outerwear').notNull().default(''),
    tops: text('tops').notNull().default(''),
    bottoms: text('bottoms').notNull().default(''),
    imageKey: text('image_key'),            // コーデ写真のオブジェクトキー(Should 機能。写真なしは null)
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
  },
  (t) => [unique().on(t.userId, t.date)]    // ユーザー×日付で一意
)
```

現行スキーマからの変更点:

- **Prefecture テーブルを廃止**。地域マスタ(表示名+気象庁地域コード)はコード(`packages/schema`)に持ち、user には気象庁地域コードのみ保存する(正規化とシンプル化)。緯度経度は不要になる
- **Coordinate に `date` カラムを追加**し、`(userId, date)` を一意制約に(upsert 前提)
- パスワードは Better Auth 管理(account テーブルの `password` に scrypt ハッシュ)。現行の bcrypt ハッシュは移行しない(本番ユーザー不在のため)

マイグレーションは drizzle-kit(`drizzle-kit generate` / `migrate`)で管理する。

---

## 9. API 設計(Hono)

| メソッド / パス | 認証 | 内容 |
| --- | --- | --- |
| `ALL /api/auth/*` | - | Better Auth ハンドラ(signup / login / logout / session / updateUser 等) |
| `GET /api/forecast?area={code}` | 必要 | 気象庁 JSON から週間予報を取得し整形して返す。`area` 省略時はユーザーの登録地域、指定時はマスタ照合の上その地域(地域切替用) |
| `GET /api/coordinates?from&to` | 必要 | 自分のコーデ一覧(期間指定可) |
| `PUT /api/coordinates` | 必要 | `{ items: [{ date, outerwear, tops, bottoms }] }` を一括 upsert |
| `DELETE /api/coordinates/:date` | 必要 | 指定日のコーデ削除。写真があればストレージのオブジェクトも削除(Should) |
| `POST /api/uploads` | 必要 | コーデ写真用の署名付きURL(presigned URL)を発行(Should)。ブラウザからストレージへ直接 PUT し、API サーバーに画像は通さない |

- セッション判定はミドルウェアで `auth.api.getSession({ headers })` を実行し、`c.get('user')` に格納。未認証は 401
- リクエストボディは `@hono/zod-validator` + `packages/schema` の Zod スキーマで検証(フロントと同一スキーマ)
- ルートはメソッドチェーンで定義し `export type AppType` を公開 → web 側 `hc<AppType>` で型安全に呼ぶ
- 気象庁 JSON エンドポイント:
  `https://www.jma.go.jp/bosai/forecast/data/forecast/{地域コード}.json`
  - 非公式 API のため、取得・整形は `apps/api` 内の1モジュールに隔離し、仕様変更時に差し替え可能な構造にする(レスポンスは入れ子が深いため、週間予報の気温・降水確率・天気コードを共通の `Forecast` 型へ正規化する)
  - **地域コード単位でサーバー側キャッシュ(30〜60分)**を行い、気象庁サーバーへの負荷をユーザー数に比例させない
  - 利用条件: 政府標準利用規約(CC BY 4.0 互換)に基づき出典明記で商用利用可。予報は改変せず「そのまま表示」し、独自予報の生成はしない(気象業務法上の予報業務許可を不要に保つ)

---

## 10. 認証設計(Better Auth)

```ts
// apps/api/src/auth.ts(概略)
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  baseURL: process.env.BETTER_AUTH_URL,        // 例: http://localhost:3000
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.WEB_ORIGIN],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 20
  },
  user: {
    additionalFields: {
      areaCode: { type: 'string', required: true, input: true }
    }
  }
})
```

- 会員登録はフロントから `authClient.signUp.email({ email, password, name, areaCode })` の1回で完了(現行の自前 `/api/signin` は不要になる)
- フロントは `createAuthClient` + `inferAdditionalFields` プラグインで `areaCode` を型付け
- パスワードの文字種ルール(小文字+数字)は Zod スキーマでフロント/バック両方で検証

---

## 11. 非機能要件・開発環境

### 環境変数(`.env.example`)

| 変数 | 用途 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 接続文字列 |
| `BETTER_AUTH_SECRET` | セッション署名シークレット |
| `BETTER_AUTH_URL` | 公開オリジン(例: `http://localhost:3000`) |
| `WEB_ORIGIN` | trustedOrigins 用 |
| `API_PORT` / `API_ORIGIN` | API サーバのポート / rewrites 先 |
| `STORAGE_ENDPOINT` / `STORAGE_BUCKET` / `STORAGE_ACCESS_KEY_ID` / `STORAGE_SECRET_ACCESS_KEY` | S3 互換ストレージ接続情報(Should: 写真アップロード導入時に追加。ローカルは MinIO を docker-compose に追加) |

### 開発コマンド(ルート)

| コマンド | 内容 |
| --- | --- |
| `pnpm docker` | PostgreSQL 起動(docker compose) |
| `pnpm dev` | web + api を並行起動(turbo) |
| `pnpm db:generate` / `pnpm db:migrate` | drizzle-kit マイグレーション |
| `pnpm db:seed` | シード(Better Auth `auth.api.signUpEmail` 経由でテストユーザー作成) |
| `pnpm lint` / `pnpm format` | oxlint / oxfmt(手動実行) |
| `pnpm typecheck` / `pnpm test` | tsc / Vitest(手動実行) |

### Lint / Format(VoidZero / Oxc)

- **oxlint**(1.x 安定版): ESLint 代替。設定は `.oxlintrc.json`(または `oxlint.config.ts`)。unused-imports 相当など主要ルールを有効化
- **oxfmt**(ベータ): Prettier 代替。JS/TS の Prettier 適合テスト100%通過・**Tailwind クラスソート内蔵**(prettier-plugin-tailwindcss が不要になる)。1.0 までは挙動変更の可能性がある点のみ留意
- Turborepo に公式の Oxc(oxlint / oxfmt)導入ガイドがあり、モノレポ構成と干渉しない

### テスト方針(Vitest)

- `packages/schema`: バリデーションスキーマ、地域マスタ(コードの一意性・形式)、日付/気温整形ユーティリティ
- `apps/api`: 気象庁 JSON → `Forecast` 型への正規化、キャッシュ動作、認証ミドルウェアの 401 応答
- UI テスト・E2E は今回スコープ外(将来 Playwright を検討)

### シードデータ

- テストユーザー: `admin@example.com` / `password123` / 地域 `130000`(東京都)
- サンプルコーデ2件(パスワードは Better Auth の API 経由で作成し、ハッシュ形式を揃える)

---

## 12. 見送った事項(明示的な非スコープ)

- Supabase 等の BaaS 利用
- Storybook / Husky + lint-staged / GitHub Actions CI
- メール送信を伴う機能(パスワードリセット・メール検証)
- ソーシャルログイン(Better Auth で後付け可能)
- E2E テスト

---

## 13. 新リポジトリ立ち上げ手順(推奨順)

1. **ワークスペース骨組み**: pnpm-workspace.yaml / turbo.json / tsconfig.base.json / oxlint・oxfmt 設定 / .env.example / docker-compose.yml
2. **packages/schema**: Zod スキーマ(signup / login / coordinates)、地域マスタ(気象庁 府県予報区の一覧)、整形ユーティリティ + Vitest
3. **packages/db**: Drizzle 設定 → Better Auth CLI でスキーマ生成 → `prefecture` 追加フィールドと `coordinate` テーブルを追記 → 初回マイグレーション
4. **apps/api**: Better Auth インスタンス → Hono ルート(auth マウント → セッションミドルウェア → forecast / coordinates)→ シード → テスト
5. **apps/web**: Next.js 15 + Tailwind v4 + shadcn/ui 導入 → auth-client / RPC client → 画面実装(landing → signup → login → forecast)
6. **結合確認**: docker の PostgreSQL に対し signup → login → forecast 取得 → コーデ upsert の一連を通す
7. Should 機能(履歴・設定・削除・天気アイコン・写真アップロード)を順次追加。写真はストレージ契約(S3 互換)を決めてから着手

---

## 付録: 現行リポジトリから引き継ぐ資産

- 日本語バリデーションメッセージと入力ルール(§6)
- 「一覧から地域を選択する」UI の考え方(現行の都道府県セレクトを気象庁 府県予報区の一覧セレクタに発展させる)
- 気温整形(`YYYY年M月D日` / `℃` 表示)の仕様
- ヒーロー画像(`public/clouds.jpg`)は任意で流用
