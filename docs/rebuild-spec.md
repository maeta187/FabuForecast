# Haregi(ハレギ)開発仕様書

現行の FabuForecast を新リポジトリで **Haregi** として作り直すための要件・設計ドキュメント。
本書は現行リポジトリ(Next.js 13 単体構成)のコード調査と、技術選定の議論・調査の結果をまとめたもの。

- 作成日: 2026-07-18(同日更新: 天気APIの気象庁 JSON 化・地域切替/写真/AI提案の追加・フロントエンドの TanStack Start への変更 ほか)
- ステータス: 確定(実装は新リポジトリで行う)

---

## 1. アプリ概要

**Haregi(ハレギ)** は「天気予報(気温)を見ながら、日ごとの服装コーディネートを記録・管理する」Web アプリ。旧称 FabuForecast のリビルドにあたり改名した。名前は「**晴れ**(天気)+**着**(服)」のダブルミーニングで、天気と服をつなぐというアプリの本質を表す。リポジトリ名・パッケージスコープは `haregi` を用いる(例: `@haregi/schema`)。

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
| 2 | フロントエンド | **TanStack Start(v1)+ React 19** | Vite ベースで Vitest / oxlint / oxfmt とツールチェーンが統一。型安全ルーティングが Hono RPC・TS7 の方針と整合。shadcn/ui・Better Auth とも公式対応(Next.js 15 案から変更。RSC 非対応だが本アプリでは不要) |
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
| 18 | TypeScript | **7 系に統一** | 2026-07 GA の Go ネイティブコンパイラ。型検査が約10倍高速。`typescript@latest` がそのまま 7 系のため移行コストはほぼゼロ(安定版プログラマティック API は 7.1 待ちだが本スタックでは影響なし) |
| 19 | エラーハンドリング | **neverthrow を api 層に導入** | 外部 I/O(気象庁・DB・S3)の失敗を `Result` / `ResultAsync` の型付きエラーで表現。軽量で段階導入可能。web には導入しない(Effect は多機能だが本規模には過剰と判断) |
| 20 | プロジェクト名 | **Haregi(ハレギ)** | 旧称 FabuForecast から刷新。「晴れ(天気)+着(服)」のダブルミーニング。正式決定前にドメイン・ストア・商標(J-PlatPat)の被り確認を推奨 |

---

## 3. 技術スタック

| 分類 | 技術 |
| --- | --- |
| モノレポ | pnpm workspace + Turborepo |
| フロントエンド | TanStack Start v1(TanStack Router + Vite + Nitro)/ React 19 / TypeScript 7 |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| バックエンド | Hono 4 + @hono/node-server(Node.js) |
| 認証 | Better Auth(email/password、Drizzle アダプタ) |
| DB / ORM | PostgreSQL + Drizzle ORM + drizzle-kit |
| API 型共有 | Hono RPC(`hc<AppType>`) |
| データ取得・キャッシュ | TanStack Query(Hono RPC と併用) |
| バリデーション | Zod(共有パッケージ) |
| エラーハンドリング | neverthrow(`apps/api` のみ) |
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
| AI コーディネート提案(写真 × トレンド × 天気) | Could(将来構想) | §5.5 参照。保存写真・過去記録・トレンド情報・週間予報を組み合わせて LLM が提案を生成 |
| メモ・小物など項目追加 | Could | |

### 5.4 共通 UI

| 機能 | 優先度 | 備考 |
| --- | --- | --- |
| ランディングページ | Must | 現行のヒーローを刷新(仮テキスト排除) |
| ログイン状態によるナビ出し分け | Must | 現行 TODO の解消。`useSession` で切り替え |
| トースト通知 | Must | shadcn/ui(sonner) |
| レスポンシブ対応 | Must | モバイルはドロワーナビ |
| ダークモード | Could | |

### 5.5 将来構想: AI コーディネート提案(Could)

保存済みのコーデ写真・過去の着用記録・ファッショントレンド情報・週間予報を組み合わせ、「明日はこの服装がおすすめ」を生成する機能。初回リリースには含めないが、以下を前提に設計段階から布石を打っておく。

**実現方式(想定)**

1. 対象日の予報(気温・天気)を取得
2. 似た気温(±2℃程度)の過去コーデ(写真 + テキスト)を `coordinate` から抽出
3. トレンド情報を取得(下記課題参照)
4. 1〜3 をマルチモーダル LLM API(Claude API 等)に渡し、手持ちの服を踏まえた提案文を生成
5. `POST /api/suggestions`(将来追加)として提供。生成結果は日付×地域単位でキャッシュしコストを抑制

**今の設計で担保しておくこと(前方互換)**

- `coordinate` に**記録時点の気温スナップショット**(`maxTemperature` / `minTemperature`、nullable)を初回スキーマから持たせる。保存時に表示中の予報値を書き込むだけで、「似た気温の過去コーデ抽出」の材料が自然に蓄積される(後から past データを復元するのは困難なため、これだけは Must フェーズで実装する)
- コーデ写真は S3 互換ストレージにキーで保存されるため、署名付き URL で LLM に渡せる(追加の基盤変更は不要)
- 天気取得・提案生成を `apps/api` 内の独立モジュールとして分離しておく(既定の方針どおり)

**課題・リスク(実装時に要調査)**

- **トレンド情報の入手経路が最大の課題**。公開のファッショントレンド API はほぼ存在しないため、候補は (a) Web 検索 API 経由でファッションメディアを要約 (b) 季節・気温帯ごとの静的なトレンド辞書を自前管理 (c) LLM の一般知識に季節情報を添えて委ねる、のいずれか。コストと鮮度のバランスで選定する
- **LLM API はスタック初の従量課金要素**。ユーザーあたりの生成回数制限とキャッシュを必須とする
- 法的整理は §9 の方針を踏襲: 気象庁の予報値は改変せずそのまま提案の入力に使う(独自の気象予測を生成しないため予報業務許可は不要のまま)

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
haregi/
├── apps/
│   ├── web/                  # TanStack Start(フロントエンド)
│   │   ├── src/routes/       # TanStack Router ファイルルーティング(/, /signup, /login, /forecast, ...)
│   │   ├── src/components/   # shadcn/ui 取り込み先 + 独自コンポーネント
│   │   └── src/lib/          # auth-client, api-client(Hono RPC + TanStack Query)
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

- ブラウザ → `apps/web`(:3000)→ `/api/*` を `apps/api`(:3001)へプロキシ
  - 開発時は **Vite の dev proxy**、本番は **Nitro のサーバールート**(または前段のリバースプロキシ)で転送
  - 同一オリジンになるため CORS/Cookie の問題を回避
- `apps/web` は `hc<AppType>`(Hono RPC)+ **TanStack Query** で API を型安全に取得・キャッシュする
- Better Auth のエンドポイントは `/api/auth/*` にマウント(フロントは `better-auth/react` の `createAuthClient`)
- 保護ルート(`/forecast` 等)は TanStack Router の `beforeLoad` でセッションを確認し、未認証は `/login` へリダイレクト

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
    maxTemperature: real('max_temperature'), // 記録時点の予報最高気温スナップショット(null 可)
    minTemperature: real('min_temperature'), // 記録時点の予報最低気温スナップショット(null 可)
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
- **Coordinate に気温スナップショット(`maxTemperature` / `minTemperature`)を追加**。保存時に表示中の予報値を書き込み、「似た気温の過去コーデ参照」「AI コーディネート提案」(§5.5)の材料を初回リリース時点から蓄積する
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
- **エラーハンドリング(neverthrow)**: 外部 I/O(気象庁 JSON 取得・Drizzle・S3)は `ResultAsync` でラップし、型付きエラー(例: `FetchError | ParseError | UnknownAreaError | DbError`)として返す。ルートハンドラで HTTP ステータス(400 / 401 / 502 等)へ網羅的にマッピングし、例外はアプリ層に漏らさない。気象庁取得にはタイムアウト(`AbortSignal.timeout`)と軽量なリトライを併用する
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
4. **apps/api**: Better Auth インスタンス → Hono ルート(auth マウント → セッションミドルウェア → forecast / coordinates)→ neverthrow による外部 I/O のエラー型整備 → シード → テスト
5. **apps/web**: TanStack Start + Tailwind v4(`@tailwindcss/vite`)+ shadcn/ui 導入 → auth-client / RPC client / TanStack Query → ルート実装(landing → signup → login → forecast、`beforeLoad` の認証ガード含む)
6. **結合確認**: docker の PostgreSQL に対し signup → login → forecast 取得 → コーデ upsert の一連を通す
7. Should 機能(履歴・設定・削除・天気アイコン・写真アップロード)を順次追加。写真はストレージ契約(S3 互換)を決めてから着手

---

## 付録: 現行リポジトリから引き継ぐ資産

- 日本語バリデーションメッセージと入力ルール(§6)
- 「一覧から地域を選択する」UI の考え方(現行の都道府県セレクトを気象庁 府県予報区の一覧セレクタに発展させる)
- 気温整形(`YYYY年M月D日` / `℃` 表示)の仕様
- ヒーロー画像(`public/clouds.jpg`)は任意で流用
