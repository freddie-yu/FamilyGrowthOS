# FamilyGrowthOS

支持家庭看见孩子可观察的成长。当前仅实现 TASK-001 工程初始化和 FGButton 适配样例。

## 环境与安装

项目固定 **Node.js 22.23.4 / npm 11.19.0**（见 `.node-version`、`.nvmrc` 和
`package-lock.json`）。所有直接 `@tarojs/*` 包固定为 **4.3.1**，编译器为
Webpack 5.91.0，React 固定为 18.3.1。目标只包含微信小程序 weapp。
CLI 的传递诊断工具 `@tarojs/plugin-doctor` 使用上游独立版本 0.0.13，已由锁文件固定；
其余 Taro 核心、平台、框架、编译器包均为 4.3.1。
Taro React 插件的可选 peer 需要 Vite 4，因此在小程序工具 workspace 单独锁定
Vite 4.5.14；它不作为小程序编译器。后台独立使用 Vite 6.4.5，不忽略 peer 约束。
根级测试工具也固定 React/React DOM 18.3.1，避免测试库自行选择 React 19。
`schema-utils` 仅对 4.x 范围锁为 4.3.2，兼容 Taro 指定的 Webpack 5.91.0；
小程序工具单独锁定 `react-refresh` 0.14.2，后台插件保留自身兼容版本。

切换到所需 Node 版本后，在仓库根目录执行：

```sh
npm ci
npm run verify
```

本机系统 Node 为 24；本次使用项目忽略目录中的独立 Node，无需更改系统安装。
在 PowerShell 中可用以下命令重现（有 Node 22 的机器直接使用系统版本）：

```powershell
npm install --prefix .tools/node node@22.23.4 --no-save --package-lock=false
$env:PATH = "$PWD/.tools/node/node_modules/node/bin;$env:PATH"
node --version
$taskNpmCli = Join-Path (Split-Path (Get-Command npm.cmd).Source) 'node_modules/npm/bin/npm-cli.js'
node $taskNpmCli ci
node $taskNpmCli run verify
```

依赖安装自动设置本仓库的 `core.hooksPath=.githooks`。`pre-commit` 执行
lint/typecheck/tests；`commit-msg` 拒绝不符合 Conventional Commits 的提交信息。
单元测试直接调用该 hook，使用临时消息文件，不创建提交。CI 下跳过本地 hook 安装。

## 本地命令

在三个终端分别运行：

```sh
npm run dev:server
npm run dev:admin
npm run dev:mini
```

- 服务端：`http://127.0.0.1:8080/healthz`，仅检查进程存活，不代表数据库就绪。
- 后台：`http://127.0.0.1:5173`，React 18 + Ant Design 5 + Vite。
- 小程序：Taro watch 编译到 `miniprogram/dist/`。用微信开发者工具导入
  `miniprogram/`，本地 `touristappid` 仅作样例占位。真实 AppID 可在被忽略的
  `project.private.config.json` 中覆盖；需平台环境才能验证预览、登录和网络请求。

```sh
npm run build              # server、web-admin、weapp，默认 prod
npm run build:mini -- staging
npm run build:admin -- dev
npm run dev:server -- staging
npm run lint
npm run typecheck
npm run format:check
npm run test:coverage
npm run test:smoke         # 先 build；产物检查及三端 dev 启动探测，结束清理子进程
```

`verify` 依次执行 tokens、lint、格式、类型、覆盖率、三端构建及本地启动探测。
启动探测使用 18080/15173 端口，Taro 探测只证明 watch 编译成功，不证明微信运行时。
`test:smoke` 最后一次 watch 会将 weapp 产物改为开发构建，交付前可再次 `build:mini`。

## 环境隔离与秘密

`config/environments/{dev,staging,prod}.json` 只含公开配置。CLI 第三个参数优先，
其次 `APP_ENV`，否则 dev 命令默认 dev、build 命令默认 prod。staging/prod 的
`.example.invalid` 域名是不可用占位，不应作为真实服务地址。真实域名确定后再显式配置。

服务端分别读取自身工作目录下的 `.env.<APP_ENV>.local`（复制对应
`server/.env.*.example`），随后以进程注入的变量覆盖。不会加载泛用 `.env` 或
其他环境的文件，也不修改 `process.env`。云托管请注入服务端环境变量。
客户端只编译公开配置白名单；不自动注入 `VITE_*`、CloudBase、Redis 或其他凭据。

后端依赖已包含 CloudBase **document database** Node SDK、Joi、Redis；连接、集合和
索引属于 TASK-002，当前没有外部服务连接或假数据就绪声明。JWT/角色归属校验属于后续任务。
运行环境使用 `Asia/Shanghai`，业务日历的实现与边界测试在所属任务完成。

## UI 本地所有权

- `shared/ui/tokens.json`：唯一视觉值来源，记录固定上游 revision 和本地增补。
- `shared/ui/contracts.ts`：框架无关的 FGButton 属性及无载荷 `onPress` 意图。
- `npm run tokens:generate`：生成小程序 SCSS、后台 CSS；修改 JSON 后运行。
- `npm run tokens:check`：拒绝过期生成物。
- `miniprogram/ui/`：仅使用 Taro 组件的 FGButton；原生 hoverClass 提供按压状态。
- `web-admin/src/ui/`：Ant Design theme 与 FGButton；不替换后台组件库。

以 375px 设计宽度书写逻辑 px；Taro `deviceRatio[375]=2` 只转换一次。
产物测试检查 44px 触控尺寸转换为 88rpx、50px 圆角转换为 100rpx、2px
按压位移转换为 4rpx。中文换行、触控实际尺寸与反馈仍须微信工具及真机确认。
字体立即使用系统中文 fallback，没有联网字体、上游 Web UI、图标或动画包。
根据 UI_CONTRACT 的可读性要求，增补本地 `color.text.onPrimary=#3b291a`：
与主色/按压色的计算对比度分别为 6.59:1 / 4.68:1；原有 heading 值保持不变。
这只是颜色计算与自动化约束，设备显示效果仍待验证。
来源和 MIT 声明见 `shared/ui/THIRD_PARTY_NOTICES.md`、`docs/UI_CONTRACT.md`。

## CI 与云托管基础

`.github/workflows/ci.yml` 在 Windows/Linux 上执行 `npm ci` 和同一条 `npm run verify`，
只上传构建及覆盖率产物。没有自动部署步骤；远端绿色状态须实际授权运行后确认。
本地自动化只校验 YAML 和命令契约。

另有 Linux `container` 验收任务：构建生产 Docker 镜像、启动临时容器、检查
`/healthz` 返回 `status=ok` 与 `environment=prod`，最后清理容器。此检查通过也只代表
容器可运行，微信云托管部署、平台路由和真实设备仍须在各自环境验收。

提供云托管容器配置（在仓库根目录构建）：

```sh
docker build -f server/Dockerfile -t family-growth-server .
```

镜像使用 Node 22.23.4、8080 端口和非 root 用户。Docker、微信开发者工具、CloudBase、
Redis、真机与远端 CI 的真实验证状态以 `tasks.md` 的记录为准；没有执行的检查不计通过。
