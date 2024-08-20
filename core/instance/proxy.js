/*
  我们要知道哪个属性被修改了，我们才能对页面上的内容进行更新
  所以我们必须能够捕获修改的这个事件
  所以我们需要用代理的方式来监听属性修改
*/

/**
 * 创建代理
 * @param {*} vm Due对象
 * @param {*} obj 要代理的对象
 * @param {*} namespace 命名空间
 */
export function constructProxy(vm, obj, namespace) {
  // 递归代理属性

  let proxyObj = null

  if (obj instanceof Array) {
    // 数组
    proxyObj = new Array(obj.length)
    for (let i = 0; i < obj.length; i++) {
      proxyObj[i] = constructProxy(vm, obj[i], namespace)
    }
    proxyObj = proxyArray(vm, proxyObj, namespace)
  } else if (obj instanceof Object) {
    // 对象
    proxyObj = constructObjectProxy(vm, obj, namespace)
  } else {
    throw new Error('error')
  }

  return proxyObj
}

/**
 * 数组代理
 * @param {*} vm Due对象
 * @param {*} obj 要代理的对象
 * @param {*} namespace 命名空间
 */
function proxyArray(vm, arr, namespace) {
  let obj = {
    eleType: 'Array',
    toString: function () {
      let result = ''
      for (let i = 0; i < obj.length; i++) {
        result += obj[i] + ', '
      }
      return result.substring(0, result.length - 2)
    },
    push() {},
    pop() {},
    shift() {},
    unshift() {},
  }
  defArrayFunc.call(vm, obj, 'push', namespace, vm)
  defArrayFunc.call(vm, obj, 'pop', namespace, vm)
  defArrayFunc.call(vm, obj, 'shift', namespace, vm)
  defArrayFunc.call(vm, obj, 'unshift', namespace, vm)
  arr.__proto__ = obj
  return arr
}

/**
 * 对象代理
 * @param {*} vm Due对象
 * @param {*} obj 要代理的对象
 * @param {*} namespace 命名空间
 * @returns
 */
function constructObjectProxy(vm, obj, namespace) {
  let proxyObj = {}
  for (let prop in obj) {
    // 挂载到_data代理对象上
    Object.defineProperty(proxyObj, prop, {
      configurable: true,
      get() {
        return obj[prop]
      },
      set(newVal) {
        console.log(getNameSpace(namespace, prop))
        obj[prop] = newVal
      },
    })

    // 挂载到vm自身
    Object.defineProperty(vm, prop, {
      configurable: true,
      get() {
        return obj[prop]
      },
      set(newVal) {
        console.log(getNameSpace(namespace, prop))
        obj[prop] = newVal
      },
    })

    if (obj[prop] instanceof Object) {
      proxyObj[prop] = constructProxy(vm, obj[prop], getNameSpace(namespace, prop))
    }
  }

  return proxyObj
}

/**
 * 获取命名空间
 * @param {*} nowNameSpace
 * @param {*} nowProp
 */
function getNameSpace(nowNameSpace, nowProp) {
  if (!nowNameSpace) {
    return nowProp
  } else if (!nowProp) {
    return nowNameSpace
  } else {
    return `${nowNameSpace}.${nowProp}`
  }
}

const arrayProto = Array.prototype

/**
 * 重写数组方法
 * @param {*} obj 自定义的数组原型对象
 * @param {*} funcName 数组方法名
 * @param {*} namespace 命名空间
 * @param {*} vm Due对象
 */
function defArrayFunc(obj, funcName, namespace, vm) {
  Object.defineProperty(obj, funcName, {
    enumerable: true,
    configurable: true,
    value: function (...args) {
      const result = arrayProto[funcName].apply(this, args)
      console.log(getNameSpace(namespace, ''))
      return result
    },
  })
}
