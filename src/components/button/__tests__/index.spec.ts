import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import KButton from '../index'

describe('KButton 方形按钮（square）', () => {
  it('square 默认 20x20，且带 is-square 类', () => {
    const wrapper = mount(KButton, { props: { square: true } })
    const btn = wrapper.find('button')
    expect(btn.classes()).toContain('is-square')
    expect((btn.element as HTMLElement).style.width).toBe('20px')
    expect((btn.element as HTMLElement).style.height).toBe('20px')
  })

  it('width/height 可自定义尺寸（数字按 px）', () => {
    const wrapper = mount(KButton, { props: { square: true, width: 28, height: 28 } })
    const el = wrapper.find('button').element as HTMLElement
    expect(el.style.width).toBe('28px')
    expect(el.style.height).toBe('28px')
  })

  it('只设 width 时 height 跟随保持正方形', () => {
    const wrapper = mount(KButton, { props: { square: true, width: 32 } })
    const el = wrapper.find('button').element as HTMLElement
    expect(el.style.width).toBe('32px')
    expect(el.style.height).toBe('32px')
  })

  it('width/height 也支持字符串 CSS 值', () => {
    const wrapper = mount(KButton, { props: { square: true, width: '2.5rem', height: '2.5rem' } })
    const el = wrapper.find('button').element as HTMLElement
    expect(el.style.width).toBe('2.5rem')
    expect(el.style.height).toBe('2.5rem')
  })

  it('非 square 时不设置内联尺寸', () => {
    const wrapper = mount(KButton)
    const el = wrapper.find('button').element as HTMLElement
    expect(el.style.width).toBe('')
    expect(el.style.height).toBe('')
  })

  it('保留常规能力：type/disabled/plain 类存在', () => {
    const wrapper = mount(KButton, {
      props: { square: true, width: 24, height: 24, type: 'primary', plain: true, disabled: true },
    })
    const btn = wrapper.find('button')
    expect(btn.classes()).toContain('k-btn--primary')
    expect(btn.classes()).toContain('is-plain')
    expect(btn.classes()).toContain('is-disabled')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('自定义 style 背景色透传（配合 square）', () => {
    const wrapper = mount(KButton, {
      props: { square: true, width: 30, height: 30 },
      attrs: { style: { background: '#7c3aed', borderColor: '#7c3aed' } },
    })
    const el = wrapper.find('button').element as HTMLElement
    // jsdom 规范化为 rgb
    expect(el.style.background).toBe('rgb(124, 58, 237)')
    // square 尺寸仍保留
    expect(el.style.width).toBe('30px')
  })

  it('点击触发 click，disabled 时阻止', async () => {
    const onClick = vi.fn()
    const wrapper = mount(KButton, { props: { square: true, onClick } })
    await wrapper.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)

    const disabled = mount(KButton, { props: { square: true, disabled: true, onClick } })
    await disabled.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1) // 未被再次调用
  })
})

describe('KButton 链接模式（href）', () => {
  it('传入 href 时渲染为 <a> 而非 <button>，href 原样透传', () => {
    const wrapper = mount(KButton, { props: { href: '#products' } })
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('a').attributes('href')).toBe('#products')
  })

  it('target=_blank 且未传 rel 时自动补 noopener noreferrer', () => {
    const wrapper = mount(KButton, { props: { href: 'https://github.com', target: '_blank' } })
    expect(wrapper.find('a').attributes('rel')).toBe('noopener noreferrer')
  })

  it('显式 rel 优先于自动补全', () => {
    const wrapper = mount(KButton, {
      props: { href: 'https://github.com', target: '_blank', rel: 'noopener' },
    })
    expect(wrapper.find('a').attributes('rel')).toBe('noopener')
  })

  it('链接按钮 disabled 时不可导航且带 aria-disabled', async () => {
    const wrapper = mount(KButton, { props: { href: 'https://github.com', disabled: true } })
    const a = wrapper.find('a')
    expect(a.attributes('aria-disabled')).toBe('true')
    await a.trigger('click')
    // preventDefault 后不会发生导航；这里只断言 click 事件仍冒泡给监听者与否
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('链接按钮点击仍触发 click 事件', async () => {
    const wrapper = mount(KButton, { props: { href: '#top' } })
    await wrapper.find('a').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('href 与 target 均未传时保持原生 button 行为', () => {
    const wrapper = mount(KButton, { props: { nativeType: 'submit' } })
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('type')).toBe('submit')
  })
})
