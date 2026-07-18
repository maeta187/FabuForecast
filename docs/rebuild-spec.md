# FabuForecast リビルド仕様書

新リポジトリで FabuForecast を作り直すための要件・設計ドキュメント。
本書は現行リポジトリ(Next.js 13 単体構成)のコード調査と、技術選定の議論・調査の結果をまとめたもの。

- 作成日: 2026-07-18
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
| 13 | Husky + lint-staged | **見送り** | ESLint/Prettier は手動実行 |
| 14 | CI(GitHub Actions) | **今回は見送り** | 後から追加可能 |

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
| 外部 API | Open-Meteo(天気予報。API キー不要) |
| テスト | Vitest |
| Lint / Format | ESLint(flat config)+ Prettier |

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
| 会員登録(メール+パスワード+ユーザー名+登録地域) | Must | Better Auth `signUp.email` + additionalFields で都道府県を保存 |
| ログイン / ログアウト | Must | Better Auth `signIn.email` / `signOut` |
| セッション管理・保護ページ | Must | DB セッション(Cookie)。未ログインは `/login` へ |
| アカウント設定(登録地域・ユーザー名・パスワード変更) | Should | Better Auth `updateUser` / `changePassword` |
| パスワードリセット(メール送信) | Could | メールプロバイダ(Resend 等)契約が前提 |
| メールアドレス検証 | Could | 同上 |
| アカウント削除 | Could | Better Auth 組み込み(deleteUser) |

### 5.2 天気予報

| 機能 | 優先度 | 備考 |
| --- | --- | --- |
| 登録地域の週間予報(最高/最低気温) | Must | Open-Meteo。ユーザーの都道府県 → 緯度経度で取得(現行のハードコードを解消) |
| 47都道府県マスタ | Must | 現行3件 → 全県。コード内マスタ(name/value/緯度/経度) |
| 天気アイコン(晴れ/曇り/雨) | Should | Open-Meteo の `weathercode` を追加取得 |
| 降水確率 | Could | `precipitation_probability_max` |

### 5.3 コーディネート(中核機能)

| 機能 | 優先度 | 備考 |
| --- | --- | --- |
| 日付ごとのコーデ登録(アウター/トップス/ボトムス) | Must | 現行未実装の保存 API を含む。ユーザー×日付で一意(upsert) |
| 保存済みコーデの表示・編集 | Must | 予報画面に既存データを反映 |
| コーデの削除 | Should | |
| 過去コーデの履歴一覧 | Should | 記録アプリとしての価値。当日の気温も併記 |
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
| `/forecast` | 週間予報+コーデ入力(メイン画面) | 必要 | Must |
| `/history` | 過去コーデ履歴 | 必要 | Should |
| `/settings` | アカウント設定 | 必要 | Should |

> 現行の `/coordination/create` は `/forecast` に統合する(予報閲覧と入力を1画面に)。

### 入力バリデーション(現行仕様を踏襲)

| 項目 | ルール |
| --- | --- |
| ユーザー名(ユーザーID) | 必須 / 8文字以上 / 英数字のみ |
| メールアドレス | 必須 / メール形式 |
| 登録地域 | 必須 / 47都道府県マスタに存在する値 |
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
│   └── schema/               # Zod スキーマ / 都道府県マスタ / 共有型・整形ユーティリティ
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
  prefecture: text('prefecture').notNull(), // ★ additionalField: 都道府県コード(例 'tokyo')
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

- **Prefecture テーブルを廃止**。緯度経度付きの47都道府県マスタはコード(`packages/schema`)に持ち、user には都道府県コードのみ保存する(正規化とシンプル化)
- **Coordinate に `date` カラムを追加**し、`(userId, date)` を一意制約に(upsert 前提)
- パスワードは Better Auth 管理(account テーブルの `password` に scrypt ハッシュ)。現行の bcrypt ハッシュは移行しない(本番ユーザー不在のため)

マイグレーションは drizzle-kit(`drizzle-kit generate` / `migrate`)で管理する。

---

## 9. API 設計(Hono)

| メソッド / パス | 認証 | 内容 |
| --- | --- | --- |
| `ALL /api/auth/*` | - | Better Auth ハンドラ(signup / login / logout / session / updateUser 等) |
| `GET /api/forecast` | 必要 | ユーザーの都道府県 → 緯度経度で Open-Meteo から週間予報を取得し整形して返す |
| `GET /api/coordinates?from&to` | 必要 | 自分のコーデ一覧(期間指定可) |
| `PUT /api/coordinates` | 必要 | `{ items: [{ date, outerwear, tops, bottoms }] }` を一括 upsert |
| `DELETE /api/coordinates/:date` | 必要 | 指定日のコーデ削除(Should) |

- セッション判定はミドルウェアで `auth.api.getSession({ headers })` を実行し、`c.get('user')` に格納。未認証は 401
- リクエストボディは `@hono/zod-validator` + `packages/schema` の Zod スキーマで検証(フロントと同一スキーマ)
- ルートはメソッドチェーンで定義し `export type AppType` を公開 → web 側 `hc<AppType>` で型安全に呼ぶ
- Open-Meteo リクエスト例:
  `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia%2FTokyo`

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
      prefecture: { type: 'string', required: true, input: true }
    }
  }
})
```

- 会員登録はフロントから `authClient.signUp.email({ email, password, name, prefecture })` の1回で完了(現行の自前 `/api/signin` は不要になる)
- フロントは `createAuthClient` + `inferAdditionalFields` プラグインで `prefecture` を型付け
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

### 開発コマンド(ルート)

| コマンド | 内容 |
| --- | --- |
| `pnpm docker` | PostgreSQL 起動(docker compose) |
| `pnpm dev` | web + api を並行起動(turbo) |
| `pnpm db:generate` / `pnpm db:migrate` | drizzle-kit マイグレーション |
| `pnpm db:seed` | シード(Better Auth `auth.api.signUpEmail` 経由でテストユーザー作成) |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | 品質チェック(手動実行) |

### テスト方針(Vitest)

- `packages/schema`: バリデーションスキーマ、都道府県マスタ(47件・値の一意性)、日付/気温整形ユーティリティ
- `apps/api`: 予報データ整形、URL 組み立て、認証ミドルウェアの 401 応答
- UI テスト・E2E は今回スコープ外(将来 Playwright を検討)

### シードデータ

- テストユーザー: `admin@example.com` / `password123` / 都道府県 `tokyo`
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

1. **ワークスペース骨組み**: pnpm-workspace.yaml / turbo.json / tsconfig.base.json / ESLint flat config / Prettier / .env.example / docker-compose.yml
2. **packages/schema**: Zod スキーマ(signup / login / coordinates)、47都道府県マスタ、整形ユーティリティ + Vitest
3. **packages/db**: Drizzle 設定 → Better Auth CLI でスキーマ生成 → `prefecture` 追加フィールドと `coordinate` テーブルを追記 → 初回マイグレーション
4. **apps/api**: Better Auth インスタンス → Hono ルート(auth マウント → セッションミドルウェア → forecast / coordinates)→ シード → テスト
5. **apps/web**: Next.js 15 + Tailwind v4 + shadcn/ui 導入 → auth-client / RPC client → 画面実装(landing → signup → login → forecast)
6. **結合確認**: docker の PostgreSQL に対し signup → login → forecast 取得 → コーデ upsert の一連を通す
7. Should 機能(履歴・設定・削除・天気アイコン)を順次追加

---

## 付録: 現行リポジトリから引き継ぐ資産

- 日本語バリデーションメッセージと入力ルール(§6)
- 都道府県マスタの型(name / value / latitude / longitude)と `findPrefecture` の考え方
- 気温整形(`YYYY年M月D日` / `℃` 表示)の仕様
- ヒーロー画像(`public/clouds.jpg`)は任意で流用
