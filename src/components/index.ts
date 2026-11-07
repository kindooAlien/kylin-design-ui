/**
 * 组件库统一入口（npm 包主入口）。
 *
 * 两种使用方式：
 *
 *  1. 全量安装（简单直接，注册全部组件与指令）：
 *     ```ts
 *     import KylinUI from '@kindoo/kdesign'
 *     import '@kindoo/kdesign/dist/index.css'
 *     app.use(KylinUI)
 *     ```
 *     模板中即可直接使用 `<KButton />` 等所有 K 前缀组件。
 *
 *  2. 按需引入（推荐，配合构建工具 tree-shaking 只打包用到的组件）：
 *     ```ts
 *     import { KButton, KDialog, KForm } from '@kindoo/kdesign'
 *     ```
 *     组件在页面内局部注册使用，也可 `app.use(KButton)` 单独全局注册。
 *
 * 样式说明：组件样式已随组件文件导入，全量安装时引入一次
 * `@kindoo/kdesign/dist/index.css` 即可；按需引入时样式由构建工具按导入链自动收集
 * （工程基于 sass 源码分发，无需额外插件）。
 */
// Design tokens（--k-* CSS 变量）必须最先进入样式产物：组件样式全部消费这些
// 变量，缺失时按钮/输入框等会退化成无背景无圆角的裸样式（npm 包消费者的
// 项目里不会像演示站那样单独引入 tokens.scss，所以必须在入口随样式打包）。
import '@/assets/styles/tokens.scss'
import { withInstall } from '@/utils/install'

/* 基础组件 */
import KAlertRaw from './alert/index'
import KAvatarRaw from './avatar/index'
import { AvatarGroup as AvatarGroupRaw } from './avatar/index'
import KBadgeRaw from './badge/index'
import KBreadcrumbRaw from './breadcrumb/index'
import KButtonRaw from './button/index'
import KButtonGroupRaw from './button-group/index'
import KCardRaw from './card/index'
import KIconRaw from './icon/index'
import KImageRaw from './image/index'
import KImageViewerRaw from './image-viewer/index'
import KInfoPopoverRaw from './info-popover/index'
import KTagRaw from './tag/index'
import KPaginationRaw from './pagination/index'

/* 布局与导航 */
import KContainerRaw from './container/index'
import { KHeader as KHeaderRaw, KAside as KAsideRaw, KMain as KMainRaw, KFooter as KFooterRaw } from './container/index'
import KMenuRaw from './menu/index'
import KDropdownRaw from './dropdown/index'
import KTabRaw from './tab/index'
import KPageHeaderRaw from './page-header/index'
import KStepsRaw from './steps/index'

/* 表单组件 */
import KInputRaw from './input/index'
import KSelectRaw from './select/index'
import KRadioRaw from './radio/index'
import KRadioGroupRaw from './radio/group'
import KCheckboxRaw from './checkbox/index'
import KInputNumberRaw from './input-number/index'
import KUploadRaw from './upload/index'
import KFormRaw from './form/index'
import { KFormItem as KFormItemRaw } from './form/index'
import KCascaderRaw from './cascader/index'
import KTransferRaw from './transfer/index'
import KTreeSelectRaw from './tree-select/index'
import KDatePickerRaw from './date-picker/date-picker'
import KDatePickerPaneRaw from './date-picker/index'
import KTimePickerRaw from './time-picker/index'
import KTimeSelectRaw from './time-select/index'
import KDateTimePickerRaw from './date-time-picker/index'
import KRateRaw from './rate/index'
import KSliderRaw from './slider/index'
import KSwitchRaw from './switch/index'

/* 反馈组件 */
import KDialogRaw from './dialog/index'
import KDrawerRaw from './drawer/index'
import KMessageRaw from './message/index'
import KMessageBoxRaw from './message-box/index'
import KNoticeRaw from './notice/index'
import KLoadingRaw from './loading/index'
import KResultRaw from './result/index'
import KProgressRaw from './progress/index'
import KTooltipRaw from './tooltip/index'
import KPopperRaw from './popper/index'
import KOverlayRaw from './overlay/index'
import KScrollBarRaw from './scrollbar/index'

/* 数据展示 */
import KTreeRaw from './tree/index'
import KSupTableRaw from './supper-table/index'
import { KRow as KRowRaw, KCol as KColRaw } from './grid/index'
import { BaseTable as BaseTableRaw, SelectionTable as SelectionTableRaw, TreeTable as TreeTableRaw } from './table/index'
import KDescriptionsRaw from './descriptions/index'
import KFormatBarRaw from './format-bar/index'
import KCollapseRaw from './collapse/index'

/* 指令与命令式 API */
import KLoadingDirectiveRaw from './loading/directive'

/* ===================== 按需导出（均支持 app.use(KXxx) 单独全局注册） ===================== */

export { withInstall, withInstallDirective } from '@/utils/install'
export { notice } from './notice/useNotice'
export { vLoading } from './loading/directive'

/* 命令式 API（对标 Element Plus 的 ElMessage / ElMessageBox） */
export { message } from './message/useMessage'
export { messageBox } from './message-box/useMessageBox'
export type { MessageOptions } from './message/useMessage'

export const KAlert = withInstall(KAlertRaw)
export const KAvatar = withInstall(KAvatarRaw, 'KAvatar')
export const AvatarGroup = withInstall(AvatarGroupRaw, 'KAvatarGroup')
export const KBadge = withInstall(KBadgeRaw)
export const KBreadcrumb = withInstall(KBreadcrumbRaw, 'KBreadcrumb')
export const KButton = withInstall(KButtonRaw)
export const KButtonGroup = withInstall(KButtonGroupRaw)
export const KCard = withInstall(KCardRaw)
export const KIcon = withInstall(KIconRaw)
export const KImage = withInstall(KImageRaw)
export const KImageViewer = withInstall(KImageViewerRaw)
export const KInfoPopover = withInstall(KInfoPopoverRaw, 'KInfoPopover')
export const KTag = withInstall(KTagRaw)
export const KPagination = withInstall(KPaginationRaw, 'KPagination')

export const KContainer = withInstall(KContainerRaw, 'KContainer')
export const KHeader = withInstall(KHeaderRaw, 'KHeader')
export const KAside = withInstall(KAsideRaw, 'KAside')
export const KMain = withInstall(KMainRaw, 'KMain')
export const KFooter = withInstall(KFooterRaw, 'KFooter')
export const KMenu = withInstall(KMenuRaw)
export const KDropdown = withInstall(KDropdownRaw)
export const KTab = withInstall(KTabRaw)
export const KPageHeader = withInstall(KPageHeaderRaw)
export const KSteps = withInstall(KStepsRaw)

export const KInput = withInstall(KInputRaw)
export const KSelect = withInstall(KSelectRaw)
export const KRadio = withInstall(KRadioRaw)
export const KRadioGroup = withInstall(KRadioGroupRaw)
export const KCheckbox = withInstall(KCheckboxRaw)
export const KInputNumber = withInstall(KInputNumberRaw)
export const KUpload = withInstall(KUploadRaw)
export const KForm = withInstall(KFormRaw)
export const KFormItem = withInstall(KFormItemRaw, 'KFormItem')
export const KCascader = withInstall(KCascaderRaw)
export const KTransfer = withInstall(KTransferRaw)
export const KTreeSelect = withInstall(KTreeSelectRaw)
export const KDatePicker = withInstall(KDatePickerRaw)
export const KDatePickerPane = withInstall(KDatePickerPaneRaw)
export const KTimePicker = withInstall(KTimePickerRaw)
export const KTimeSelect = withInstall(KTimeSelectRaw)
export const KDateTimePicker = withInstall(KDateTimePickerRaw)
export const KRate = withInstall(KRateRaw)
export const KSlider = withInstall(KSliderRaw)
export const KSwitch = withInstall(KSwitchRaw)

export const KDialog = withInstall(KDialogRaw)
export const KDrawer = withInstall(KDrawerRaw)
export const KMessage = withInstall(KMessageRaw)
export const KMessageBox = withInstall(KMessageBoxRaw)
export const KNotice = withInstall(KNoticeRaw, 'KNotice')
export const KLoading = withInstall(KLoadingRaw)
export const KResult = withInstall(KResultRaw)
export const KProgress = withInstall(KProgressRaw)
export const KTooltip = withInstall(KTooltipRaw)
export const KPopper = withInstall(KPopperRaw)
export const KOverlay = withInstall(KOverlayRaw)
export const KScrollBar = withInstall(KScrollBarRaw, 'KScrollBar')

export const KTree = withInstall(KTreeRaw)
export const KSupTable = withInstall(KSupTableRaw)
export const KDescriptions = withInstall(KDescriptionsRaw)
export const KFormatBar = withInstall(KFormatBarRaw)
export const KCollapse = withInstall(KCollapseRaw)
export const KRow = withInstall(KRowRaw, 'KRow')
export const KCol = withInstall(KColRaw, 'KCol')
export const BaseTable = withInstall(BaseTableRaw)
export const SelectionTable = withInstall(SelectionTableRaw)
export const TreeTable = withInstall(TreeTableRaw)

/** v-loading 指令：`app.use(vLoadingDirective)` 全局注册，或 `app.directive('loading', vLoading)` 手动注册 */
export const vLoadingDirective = KLoadingDirectiveRaw

/* ===================== 全量安装插件 ===================== */

/**
 * 组件库全量安装插件：`app.use(KylinUI)` 一次性注册全部组件与 v-loading 指令。
 * 组件注册名统一为 K 前缀（KAvatar/KBreadcrumb/KContainer/KInfoPopover/
 * KPagination/KScrollBar/KNotice/KForm/KFormItem/KRow/KCol 等在源内 name
 * 缺失或不规范，已在此处显式补齐）。
 */
const KylinUI = {
  install(app: import('vue').App) {
    const components = [
      KAlert, KAvatar, AvatarGroup, KBadge, KBreadcrumb,
      KButton, KButtonGroup, KCard, KIcon, KImage, KImageViewer,
      KInfoPopover, KTag, KPagination,
      KContainer, KHeader, KAside, KMain, KFooter,
      KMenu, KDropdown, KTab, KPageHeader, KSteps,
      KInput, KSelect, KRadio, KRadioGroup, KCheckbox, KInputNumber, KUpload,
      KForm, KFormItem, KCascader, KTransfer, KTreeSelect,
      KDatePicker, KTimePicker, KTimeSelect, KDateTimePicker,
      KRate, KSlider, KSwitch,
      KDialog, KDrawer, KMessage, KMessageBox, KNotice,
      KLoading, KResult, KProgress, KTooltip, KPopper, KOverlay, KScrollBar,
      KTree, KSupTable, KDescriptions, KFormatBar, KCollapse,
      KRow, KCol, BaseTable, SelectionTable, TreeTable,
    ]
    components.forEach((c) => app.use(c))
    app.use(vLoadingDirective)
  },
}
export default KylinUI
