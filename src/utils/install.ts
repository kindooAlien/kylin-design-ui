import type { App, Component, Directive, Plugin } from 'vue'

/**
 * 给组件对象附加 install 方法的类型：附加后既可按需引入直接使用，
 * 也可被 app.use() 注册为全局组件
 */
export type WithInstall<T> = T & Plugin

/**
 * withInstall — 为组件附加 install 方法，使其支持两种使用方式：
 *
 *  1. 按需引入（推荐，利于 tree-shaking）：
 *     `import { KButton } from '@kindoo/kdesign'` 后在页面内直接使用；
 *  2. 全局注册：
 *     `app.use(KButton)` 或统一入口 `app.use(KylinUI)` 全量注册。
 *
 * @param comp 组件定义对象
 * @param name 可选的全局注册组件名；缺省取组件自身 name 选项
 */
export function withInstall<T extends Component>(comp: T, name?: string): WithInstall<T> {
  const c = comp as WithInstall<T>
  c.install = (app: App) => {
    const compName = name ?? (comp as { name?: string }).name
    if (compName) {
      app.component(compName, comp)
    }
  }
  return c
}

/**
 * withInstallDirective — 为自定义指令附加 install 方法，
 * 支持 `app.use(vLoading)` 全局注册指令。
 *
 * @param directive 指令对象
 * @param name 注册的指令名（模板中使用 v-name）
 */
export function withInstallDirective<T extends Directive>(directive: T, name: string): T & Plugin {
  const d = directive as T & Plugin
  d.install = (app: App) => {
    app.directive(name, directive)
  }
  return d
}
