export function getCssVariable(str: string) {
  try {
    if (!str) {
      console.warn('Empty CSS variable name');
      return '#409EFF'; // 默认使用Element Plus的主色
    }
    
    const value = getComputedStyle(document.documentElement).getPropertyValue(str);
    
    // 如果获取的值为空，返回默认颜色
    if (!value || value.trim() === '') {
      console.warn(`CSS variable ${str} not found or empty`);
      return '#409EFF'; // 默认使用Element Plus的主色
    }
    
    return value.trim();
  } catch (error) {
    console.error('Error in getCssVariable:', error);
    return '#409EFF'; // 默认使用Element Plus的主色
  }
}

// 将hex颜色转成rgb  例如(#F55442, 1)
export function hexToRgba(
  hex: string,
  opacity: number
): { red: number; green: number; blue: number; rgba: string } {
  try {
    // 如果hex为空或无效，使用默认颜色
    if (!hex || typeof hex !== 'string') {
      hex = '#409EFF'; // 默认使用Element Plus的主色
    }
    
    // 移除可能存在的 # 前缀并转换为大写
    hex = hex.replace(/^#/, '').toUpperCase();
    
    // 如果是缩写形式（如 FFF），转换为完整形式
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char.repeat(2))
        .join('');
    }
    
    // 验证 hex 格式
    if (!/^[0-9A-F]{6}$/.test(hex)) {
      console.warn('Invalid hex color format:', hex);
      hex = '409EFF'; // 使用默认颜色
    }
    
    // 解析 RGB 值
    const [red, green, blue] = hex.match(/\w\w/g)!.map((x) => parseInt(x, 16));
    
    // 确保 opacity 在有效范围内
    opacity = Math.max(0, Math.min(1, opacity));
    
    // 构建 RGBA 字符串
    const rgba = `rgba(${red}, ${green}, ${blue}, ${opacity.toFixed(2)})`;
    
    return { red, green, blue, rgba };
  } catch (error) {
    console.error('Error in hexToRgba:', error);
    // 返回默认颜色
    return { 
      red: 64, 
      green: 158, 
      blue: 255, 
      rgba: `rgba(64, 158, 255, ${opacity.toFixed(2)})` 
    };
  }
}

// 将rgb颜色转成hex  例如(24,12,255)
export function rgbToHex(r: any, g: any, b: any) {
  const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  return hex
}

// 颜色混合
export function colourBlend(c1: string, c2: string, ratio: any) {
  ratio = Math.max(Math.min(Number(ratio), 1), 0)
  const r1 = parseInt(c1.substring(1, 3), 16)
  const g1 = parseInt(c1.substring(3, 5), 16)
  const b1 = parseInt(c1.substring(5, 7), 16)
  const r2 = parseInt(c2.substring(1, 3), 16)
  const g2 = parseInt(c2.substring(3, 5), 16)
  const b2 = parseInt(c2.substring(5, 7), 16)
  let r: any = Math.round(r1 * (1 - ratio) + r2 * ratio)
  let g: any = Math.round(g1 * (1 - ratio) + g2 * ratio)
  let b: any = Math.round(b1 * (1 - ratio) + b2 * ratio)
  r = ('0' + (r || 0).toString(16)).slice(-2)
  g = ('0' + (g || 0).toString(16)).slice(-2)
  b = ('0' + (b || 0).toString(16)).slice(-2)
  return '#' + r + g + b
}

// 回到顶部
export function scrollToTop() {
  window.scrollTo({ top: 0 })
}

export const getCssVar = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name)
}

// 处理 Element Plus 主题颜色
export function handleElementThemeColor(theme: string, isDark: boolean = false): void {
  document.documentElement.style.setProperty('--el-color-primary', theme)
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-light-${i}`,
      `${getLightColor(theme, i / 10, isDark)}`
    )
  }
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-dark-${i}`,
      `${getDarkColor(theme, i / 10)}`
    )
  }
}

// hex颜色转rgb颜色
export function hexToRgb(str: string): number[] {
  str = str.replace('#', '')
  const hexs = str.match(/../g)
  if (!hexs) {
    throw new Error('Invalid hex color')
  }
  return hexs.map((hex) => parseInt(hex, 16))
}

// 变浅颜色值
export function getLightColor(color: string, level: number, isDark: boolean = false): string {
  if (isDark) {
    return getDarkColor(color, level)
  } else {
    const rgb = hexToRgb(color)
    const newRgb = rgb.map((value) => Math.floor((255 - value) * level + value))
    return rgbToHex(newRgb[0], newRgb[1], newRgb[2])
  }
}

// 变深颜色值
export function getDarkColor(color: string, level: number): string {
  const rgb = hexToRgb(color)
  const newRgb = rgb.map((value) => Math.floor(value * (1 - level)))
  return rgbToHex(newRgb[0], newRgb[1], newRgb[2])
}

// 获取当前时间，并返回一个问候语
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) {
    return '凌晨了！'
  } else if (hour < 12) {
    return '上午好！'
  } else if (hour < 18) {
    return '下午好！'
  } else {
    return '晚上好！'
  }
}

// 判断是不是iframe
export function isIframe(url: string) {
  return url.includes('/outside/iframe')
}

// 获取iframe的title
export function getIframeTitle() {
  return decodeURIComponent(location.href.split('/').pop() || '')
}
