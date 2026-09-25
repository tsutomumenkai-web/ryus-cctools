var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function() {
  "use strict";
  function noop() {
  }
  const identity = (x) => x;
  function assign(tar, src) {
    for (const k in src) tar[k] = src[k];
    return (
      /** @type {T & S} */
      tar
    );
  }
  function is_promise(value) {
    return !!value && (typeof value === "object" || typeof value === "function") && typeof /** @type {any} */
    value.then === "function";
  }
  function add_location(element2, file, line, column, char) {
    element2.__svelte_meta = {
      loc: { file, line, column, char }
    };
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return /* @__PURE__ */ Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a && typeof a === "object" || typeof a === "function";
  }
  let src_url_equal_anchor;
  function src_url_equal(element_src, url) {
    if (element_src === url) return true;
    if (!src_url_equal_anchor) {
      src_url_equal_anchor = document.createElement("a");
    }
    src_url_equal_anchor.href = url;
    return element_src === src_url_equal_anchor.href;
  }
  function split_srcset(srcset) {
    return srcset.split(",").map((src) => src.trim().split(" ").filter(Boolean));
  }
  function srcset_url_equal(element_srcset, srcset) {
    const element_urls = split_srcset(element_srcset.srcset);
    const urls = split_srcset(srcset || "");
    return urls.length === element_urls.length && urls.every(
      ([url, width], i) => width === element_urls[i][1] && // We need to test both ways because Vite will create an a full URL with
      // `new URL(asset, import.meta.url).href` for the client when `base: './'`, and the
      // relative URLs inside srcset are not automatically resolved to absolute URLs by
      // browsers (in contrast to img.src). This means both SSR and DOM code could
      // contain relative or absolute URLs.
      (src_url_equal(element_urls[i][0], url) || src_url_equal(url, element_urls[i][0]))
    );
  }
  function not_equal(a, b) {
    return a != a ? b == b : a !== b;
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  function validate_store(store, name) {
    if (store != null && typeof store.subscribe !== "function") {
      throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
  }
  function subscribe(store, ...callbacks) {
    if (store == null) {
      for (const callback of callbacks) {
        callback(void 0);
      }
      return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  function get_store_value(store) {
    let value;
    subscribe(store, (_) => value = _)();
    return value;
  }
  function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
  }
  function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
      const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
      return definition[0](slot_ctx);
    }
  }
  function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
  }
  function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
      const lets = definition[2](fn(dirty));
      if ($$scope.dirty === void 0) {
        return lets;
      }
      if (typeof lets === "object") {
        const merged = [];
        const len = Math.max($$scope.dirty.length, lets.length);
        for (let i = 0; i < len; i += 1) {
          merged[i] = $$scope.dirty[i] | lets[i];
        }
        return merged;
      }
      return $$scope.dirty | lets;
    }
    return $$scope.dirty;
  }
  function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
      const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
      slot.p(slot_context, slot_changes);
    }
  }
  function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn);
  }
  function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
      const dirty = [];
      const length = $$scope.ctx.length / 32;
      for (let i = 0; i < length; i++) {
        dirty[i] = -1;
      }
      return dirty;
    }
    return -1;
  }
  function exclude_internal_props(props) {
    const result = {};
    for (const k in props) if (k[0] !== "$") result[k] = props[k];
    return result;
  }
  function compute_rest_props(props, keys) {
    const rest = {};
    keys = new Set(keys);
    for (const k in props) if (!keys.has(k) && k[0] !== "$") rest[k] = props[k];
    return rest;
  }
  function compute_slots(slots) {
    const result = {};
    for (const key in slots) {
      result[key] = true;
    }
    return result;
  }
  function once(fn) {
    let ran = false;
    return function(...args) {
      if (ran) return;
      ran = true;
      fn.call(this, ...args);
    };
  }
  function null_to_empty(value) {
    return value == null ? "" : value;
  }
  function set_store_value(store, ret, value) {
    store.set(value);
    return ret;
  }
  const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
  }
  function split_css_unit(value) {
    const split = typeof value === "string" && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
    return split ? [parseFloat(split[1]), split[2] || "px"] : [
      /** @type {number} */
      value,
      "px"
    ];
  }
  const contenteditable_truthy_values = ["", true, 1, "true", "contenteditable"];
  const is_client = typeof window !== "undefined";
  let now = is_client ? () => window.performance.now() : () => Date.now();
  let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
  function set_now(fn) {
    now = fn;
  }
  function set_raf(fn) {
    raf = fn;
  }
  const tasks = /* @__PURE__ */ new Set();
  function run_tasks(now2) {
    tasks.forEach((task) => {
      if (!task.c(now2)) {
        tasks.delete(task);
        task.f();
      }
    });
    if (tasks.size !== 0) raf(run_tasks);
  }
  function clear_loops() {
    tasks.clear();
  }
  function loop(callback) {
    let task;
    if (tasks.size === 0) raf(run_tasks);
    return {
      promise: new Promise((fulfill) => {
        tasks.add(task = { c: callback, f: fulfill });
      }),
      abort() {
        tasks.delete(task);
      }
    };
  }
  const globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : (
    // @ts-ignore Node typings have this
    global
  );
  class ResizeObserverSingleton {
    /** @param {ResizeObserverOptions} options */
    constructor(options) {
      /**
       * @private
       * @readonly
       * @type {WeakMap<Element, import('./private.js').Listener>}
       */
      __publicField(this, "_listeners", "WeakMap" in globals ? /* @__PURE__ */ new WeakMap() : void 0);
      /**
       * @private
       * @type {ResizeObserver}
       */
      __publicField(this, "_observer");
      /** @type {ResizeObserverOptions} */
      __publicField(this, "options");
      this.options = options;
    }
    /**
     * @param {Element} element
     * @param {import('./private.js').Listener} listener
     * @returns {() => void}
     */
    observe(element2, listener) {
      this._listeners.set(element2, listener);
      this._getObserver().observe(element2, this.options);
      return () => {
        this._listeners.delete(element2);
        this._observer.unobserve(element2);
      };
    }
    /**
     * @private
     */
    _getObserver() {
      return this._observer ?? (this._observer = new ResizeObserver((entries) => {
        var _a;
        for (const entry of entries) {
          ResizeObserverSingleton.entries.set(entry.target, entry);
          (_a = this._listeners.get(entry.target)) == null ? void 0 : _a(entry);
        }
      }));
    }
  }
  ResizeObserverSingleton.entries = "WeakMap" in globals ? /* @__PURE__ */ new WeakMap() : void 0;
  let is_hydrating = false;
  function start_hydrating() {
    is_hydrating = true;
  }
  function end_hydrating() {
    is_hydrating = false;
  }
  function upper_bound(low, high, key, value) {
    while (low < high) {
      const mid = low + (high - low >> 1);
      if (key(mid) <= value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }
  function init_hydrate(target) {
    if (target.hydrate_init) return;
    target.hydrate_init = true;
    let children2 = (
      /** @type {ArrayLike<NodeEx2>} */
      target.childNodes
    );
    if (target.nodeName === "HEAD") {
      const my_children = [];
      for (let i = 0; i < children2.length; i++) {
        const node = children2[i];
        if (node.claim_order !== void 0) {
          my_children.push(node);
        }
      }
      children2 = my_children;
    }
    const m = new Int32Array(children2.length + 1);
    const p = new Int32Array(children2.length);
    m[0] = -1;
    let longest = 0;
    for (let i = 0; i < children2.length; i++) {
      const current = children2[i].claim_order;
      const seq_len = (longest > 0 && children2[m[longest]].claim_order <= current ? longest + 1 : upper_bound(1, longest, (idx) => children2[m[idx]].claim_order, current)) - 1;
      p[i] = m[seq_len] + 1;
      const new_len = seq_len + 1;
      m[new_len] = i;
      longest = Math.max(new_len, longest);
    }
    const lis = [];
    const to_move = [];
    let last = children2.length - 1;
    for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
      lis.push(children2[cur - 1]);
      for (; last >= cur; last--) {
        to_move.push(children2[last]);
      }
      last--;
    }
    for (; last >= 0; last--) {
      to_move.push(children2[last]);
    }
    lis.reverse();
    to_move.sort((a, b) => a.claim_order - b.claim_order);
    for (let i = 0, j = 0; i < to_move.length; i++) {
      while (j < lis.length && to_move[i].claim_order >= lis[j].claim_order) {
        j++;
      }
      const anchor = j < lis.length ? lis[j] : null;
      target.insertBefore(to_move[i], anchor);
    }
  }
  function append(target, node) {
    target.appendChild(node);
  }
  function append_styles(target, style_sheet_id, styles) {
    const append_styles_to = get_root_for_style(target);
    if (!append_styles_to.getElementById(style_sheet_id)) {
      const style = element("style");
      style.id = style_sheet_id;
      style.textContent = styles;
      append_stylesheet(append_styles_to, style);
    }
  }
  function get_root_for_style(node) {
    if (!node) return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && /** @type {ShadowRoot} */
    root.host) {
      return (
        /** @type {ShadowRoot} */
        root
      );
    }
    return node.ownerDocument;
  }
  function append_empty_stylesheet(node) {
    const style_element = element("style");
    style_element.textContent = "/* empty */";
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element.sheet;
  }
  function append_stylesheet(node, style) {
    append(
      /** @type {Document} */
      node.head || node,
      style
    );
    return style.sheet;
  }
  function append_hydration(target, node) {
    if (is_hydrating) {
      init_hydrate(target);
      if (target.actual_end_child === void 0 || target.actual_end_child !== null && target.actual_end_child.parentNode !== target) {
        target.actual_end_child = target.firstChild;
      }
      while (target.actual_end_child !== null && target.actual_end_child.claim_order === void 0) {
        target.actual_end_child = target.actual_end_child.nextSibling;
      }
      if (node !== target.actual_end_child) {
        if (node.claim_order !== void 0 || node.parentNode !== target) {
          target.insertBefore(node, target.actual_end_child);
        }
      } else {
        target.actual_end_child = node.nextSibling;
      }
    } else if (node.parentNode !== target || node.nextSibling !== null) {
      target.appendChild(node);
    }
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function insert_hydration(target, node, anchor) {
    if (is_hydrating && !anchor) {
      append_hydration(target, node);
    } else if (node.parentNode !== target || node.nextSibling != anchor) {
      target.insertBefore(node, anchor || null);
    }
  }
  function detach(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
  function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
      if (iterations[i]) iterations[i].d(detaching);
    }
  }
  function element(name) {
    return document.createElement(name);
  }
  function element_is(name, is) {
    return document.createElement(name, { is });
  }
  function object_without_properties(obj, exclude) {
    const target = (
      /** @type {Pick<T, Exclude<keyof T, K>>} */
      {}
    );
    for (const k in obj) {
      if (has_prop(obj, k) && // @ts-ignore
      exclude.indexOf(k) === -1) {
        target[k] = obj[k];
      }
    }
    return target;
  }
  function svg_element(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function empty() {
    return text("");
  }
  function comment(content) {
    return document.createComment(content);
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function prevent_default(fn) {
    return function(event) {
      event.preventDefault();
      return fn.call(this, event);
    };
  }
  function stop_propagation(fn) {
    return function(event) {
      event.stopPropagation();
      return fn.call(this, event);
    };
  }
  function stop_immediate_propagation(fn) {
    return function(event) {
      event.stopImmediatePropagation();
      return fn.call(this, event);
    };
  }
  function self(fn) {
    return function(event) {
      if (event.target === this) fn.call(this, event);
    };
  }
  function trusted(fn) {
    return function(event) {
      if (event.isTrusted) fn.call(this, event);
    };
  }
  function attr(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }
  const always_set_through_set_attribute = ["width", "height"];
  function set_attributes(node, attributes) {
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
      if (attributes[key] == null) {
        node.removeAttribute(key);
      } else if (key === "style") {
        node.style.cssText = attributes[key];
      } else if (key === "__value") {
        node.value = node[key] = attributes[key];
      } else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
        node[key] = attributes[key];
      } else {
        attr(node, key, attributes[key]);
      }
    }
  }
  function set_svg_attributes(node, attributes) {
    for (const key in attributes) {
      attr(node, key, attributes[key]);
    }
  }
  function set_custom_element_data_map(node, data_map) {
    Object.keys(data_map).forEach((key) => {
      set_custom_element_data(node, key, data_map[key]);
    });
  }
  function set_custom_element_data(node, prop, value) {
    const lower = prop.toLowerCase();
    if (lower in node) {
      node[lower] = typeof node[lower] === "boolean" && value === "" ? true : value;
    } else if (prop in node) {
      node[prop] = typeof node[prop] === "boolean" && value === "" ? true : value;
    } else {
      attr(node, prop, value);
    }
  }
  function set_dynamic_element_data(tag) {
    return /-/.test(tag) ? set_custom_element_data_map : set_attributes;
  }
  function xlink_attr(node, attribute, value) {
    node.setAttributeNS("http://www.w3.org/1999/xlink", attribute, value);
  }
  function get_svelte_dataset(node) {
    return node.dataset.svelteH;
  }
  function get_binding_group_value(group, __value, checked) {
    const value = /* @__PURE__ */ new Set();
    for (let i = 0; i < group.length; i += 1) {
      if (group[i].checked) value.add(group[i].__value);
    }
    if (!checked) {
      value.delete(__value);
    }
    return Array.from(value);
  }
  function init_binding_group(group) {
    let _inputs;
    return {
      /* push */
      p(...inputs) {
        _inputs = inputs;
        _inputs.forEach((input) => group.push(input));
      },
      /* remove */
      r() {
        _inputs.forEach((input) => group.splice(group.indexOf(input), 1));
      }
    };
  }
  function init_binding_group_dynamic(group, indexes) {
    let _group = get_binding_group(group);
    let _inputs;
    function get_binding_group(group2) {
      for (let i = 0; i < indexes.length; i++) {
        group2 = group2[indexes[i]] = group2[indexes[i]] || [];
      }
      return group2;
    }
    function push() {
      _inputs.forEach((input) => _group.push(input));
    }
    function remove() {
      _inputs.forEach((input) => _group.splice(_group.indexOf(input), 1));
    }
    return {
      /* update */
      u(new_indexes) {
        indexes = new_indexes;
        const new_group = get_binding_group(group);
        if (new_group !== _group) {
          remove();
          _group = new_group;
          push();
        }
      },
      /* push */
      p(...inputs) {
        _inputs = inputs;
        push();
      },
      /* remove */
      r: remove
    };
  }
  function to_number(value) {
    return value === "" ? null : +value;
  }
  function time_ranges_to_array(ranges) {
    const array = [];
    for (let i = 0; i < ranges.length; i += 1) {
      array.push({ start: ranges.start(i), end: ranges.end(i) });
    }
    return array;
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function init_claim_info(nodes) {
    if (nodes.claim_info === void 0) {
      nodes.claim_info = { last_index: 0, total_claimed: 0 };
    }
  }
  function claim_node(nodes, predicate, process_node, create_node, dont_update_last_index = false) {
    init_claim_info(nodes);
    const result_node = (() => {
      for (let i = nodes.claim_info.last_index; i < nodes.length; i++) {
        const node = nodes[i];
        if (predicate(node)) {
          const replacement = process_node(node);
          if (replacement === void 0) {
            nodes.splice(i, 1);
          } else {
            nodes[i] = replacement;
          }
          if (!dont_update_last_index) {
            nodes.claim_info.last_index = i;
          }
          return node;
        }
      }
      for (let i = nodes.claim_info.last_index - 1; i >= 0; i--) {
        const node = nodes[i];
        if (predicate(node)) {
          const replacement = process_node(node);
          if (replacement === void 0) {
            nodes.splice(i, 1);
          } else {
            nodes[i] = replacement;
          }
          if (!dont_update_last_index) {
            nodes.claim_info.last_index = i;
          } else if (replacement === void 0) {
            nodes.claim_info.last_index--;
          }
          return node;
        }
      }
      return create_node();
    })();
    result_node.claim_order = nodes.claim_info.total_claimed;
    nodes.claim_info.total_claimed += 1;
    return result_node;
  }
  function claim_element_base(nodes, name, attributes, create_element) {
    return claim_node(
      nodes,
      /** @returns {node is Element | SVGElement} */
      (node) => node.nodeName === name,
      /** @param {Element} node */
      (node) => {
        const remove = [];
        for (let j = 0; j < node.attributes.length; j++) {
          const attribute = node.attributes[j];
          if (!attributes[attribute.name]) {
            remove.push(attribute.name);
          }
        }
        remove.forEach((v) => node.removeAttribute(v));
        return void 0;
      },
      () => create_element(name)
    );
  }
  function claim_element(nodes, name, attributes) {
    return claim_element_base(nodes, name, attributes, element);
  }
  function claim_svg_element(nodes, name, attributes) {
    return claim_element_base(nodes, name, attributes, svg_element);
  }
  function claim_text(nodes, data) {
    return claim_node(
      nodes,
      /** @returns {node is Text} */
      (node) => node.nodeType === 3,
      /** @param {Text} node */
      (node) => {
        const data_str = "" + data;
        if (node.data.startsWith(data_str)) {
          if (node.data.length !== data_str.length) {
            return node.splitText(data_str.length);
          }
        } else {
          node.data = data_str;
        }
      },
      () => text(data),
      true
      // Text nodes should not update last index since it is likely not worth it to eliminate an increasing subsequence of actual elements
    );
  }
  function claim_space(nodes) {
    return claim_text(nodes, " ");
  }
  function claim_comment(nodes, data) {
    return claim_node(
      nodes,
      /** @returns {node is Comment} */
      (node) => node.nodeType === 8,
      /** @param {Comment} node */
      (node) => {
        node.data = "" + data;
        return void 0;
      },
      () => comment(data),
      true
    );
  }
  function get_comment_idx(nodes, text2, start) {
    for (let i = start; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node.nodeType === 8 && node.textContent.trim() === text2) {
        return i;
      }
    }
    return -1;
  }
  function claim_html_tag(nodes, is_svg2) {
    const start_index = get_comment_idx(nodes, "HTML_TAG_START", 0);
    const end_index = get_comment_idx(nodes, "HTML_TAG_END", start_index + 1);
    if (start_index === -1 || end_index === -1) {
      return new HtmlTagHydration(is_svg2);
    }
    init_claim_info(nodes);
    const html_tag_nodes = nodes.splice(start_index, end_index - start_index + 1);
    detach(html_tag_nodes[0]);
    detach(html_tag_nodes[html_tag_nodes.length - 1]);
    const claimed_nodes = html_tag_nodes.slice(1, html_tag_nodes.length - 1);
    if (claimed_nodes.length === 0) {
      return new HtmlTagHydration(is_svg2);
    }
    for (const n of claimed_nodes) {
      n.claim_order = nodes.claim_info.total_claimed;
      nodes.claim_info.total_claimed += 1;
    }
    return new HtmlTagHydration(is_svg2, claimed_nodes);
  }
  function set_data(text2, data) {
    data = "" + data;
    if (text2.data === data) return;
    text2.data = /** @type {string} */
    data;
  }
  function set_data_contenteditable(text2, data) {
    data = "" + data;
    if (text2.wholeText === data) return;
    text2.data = /** @type {string} */
    data;
  }
  function set_data_maybe_contenteditable(text2, data, attr_value) {
    if (~contenteditable_truthy_values.indexOf(attr_value)) {
      set_data_contenteditable(text2, data);
    } else {
      set_data(text2, data);
    }
  }
  function set_input_value(input, value) {
    input.value = value == null ? "" : value;
  }
  function set_input_type(input, type) {
    try {
      input.type = type;
    } catch (e) {
    }
  }
  function set_style(node, key, value, important) {
    if (value == null) {
      node.style.removeProperty(key);
    } else {
      node.style.setProperty(key, value, important ? "important" : "");
    }
  }
  function select_option(select, value, mounting) {
    for (let i = 0; i < select.options.length; i += 1) {
      const option = select.options[i];
      if (option.__value === value) {
        option.selected = true;
        return;
      }
    }
    if (!mounting || value !== void 0) {
      select.selectedIndex = -1;
    }
  }
  function select_options(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
      const option = select.options[i];
      option.selected = ~value.indexOf(option.__value);
    }
  }
  function select_value(select) {
    const selected_option = select.querySelector(":checked");
    return selected_option && selected_option.__value;
  }
  function select_multiple_value(select) {
    return [].map.call(select.querySelectorAll(":checked"), (option) => option.__value);
  }
  let crossorigin;
  function is_crossorigin() {
    if (crossorigin === void 0) {
      crossorigin = false;
      try {
        if (typeof window !== "undefined" && window.parent) {
          void window.parent.document;
        }
      } catch (error) {
        crossorigin = true;
      }
    }
    return crossorigin;
  }
  function add_iframe_resize_listener(node, fn) {
    const computed_style = getComputedStyle(node);
    if (computed_style.position === "static") {
      node.style.position = "relative";
    }
    const iframe = element("iframe");
    iframe.setAttribute(
      "style",
      "display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;"
    );
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    const crossorigin2 = is_crossorigin();
    let unsubscribe;
    if (crossorigin2) {
      iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}<\/script>";
      unsubscribe = listen(
        window,
        "message",
        /** @param {MessageEvent} event */
        (event) => {
          if (event.source === iframe.contentWindow) fn();
        }
      );
    } else {
      iframe.src = "about:blank";
      iframe.onload = () => {
        unsubscribe = listen(iframe.contentWindow, "resize", fn);
        fn();
      };
    }
    append(node, iframe);
    return () => {
      if (crossorigin2) {
        unsubscribe();
      } else if (unsubscribe && iframe.contentWindow) {
        unsubscribe();
      }
      detach(iframe);
    };
  }
  const resize_observer_content_box = /* @__PURE__ */ new ResizeObserverSingleton({
    box: "content-box"
  });
  const resize_observer_border_box = /* @__PURE__ */ new ResizeObserverSingleton({
    box: "border-box"
  });
  const resize_observer_device_pixel_content_box = /* @__PURE__ */ new ResizeObserverSingleton(
    { box: "device-pixel-content-box" }
  );
  function toggle_class(element2, name, toggle) {
    element2.classList.toggle(name, !!toggle);
  }
  function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    return new CustomEvent(type, { detail, bubbles, cancelable });
  }
  function query_selector_all(selector, parent = document.body) {
    return Array.from(parent.querySelectorAll(selector));
  }
  function head_selector(nodeId, head) {
    const result = [];
    let started = 0;
    for (const node of head.childNodes) {
      if (node.nodeType === 8) {
        const comment2 = node.textContent.trim();
        if (comment2 === `HEAD_${nodeId}_END`) {
          started -= 1;
          result.push(node);
        } else if (comment2 === `HEAD_${nodeId}_START`) {
          started += 1;
          result.push(node);
        }
      } else if (started > 0) {
        result.push(node);
      }
    }
    return result;
  }
  class HtmlTag {
    constructor(is_svg2 = false) {
      /**
       * @private
       * @default false
       */
      __publicField(this, "is_svg", false);
      /** parent for creating node */
      __publicField(this, "e");
      /** html tag nodes */
      __publicField(this, "n");
      /** target */
      __publicField(this, "t");
      /** anchor */
      __publicField(this, "a");
      this.is_svg = is_svg2;
      this.e = this.n = null;
    }
    /**
     * @param {string} html
     * @returns {void}
     */
    c(html) {
      this.h(html);
    }
    /**
     * @param {string} html
     * @param {HTMLElement | SVGElement} target
     * @param {HTMLElement | SVGElement} anchor
     * @returns {void}
     */
    m(html, target, anchor = null) {
      if (!this.e) {
        if (this.is_svg)
          this.e = svg_element(
            /** @type {keyof SVGElementTagNameMap} */
            target.nodeName
          );
        else
          this.e = element(
            /** @type {keyof HTMLElementTagNameMap} */
            target.nodeType === 11 ? "TEMPLATE" : target.nodeName
          );
        this.t = target.tagName !== "TEMPLATE" ? target : (
          /** @type {HTMLTemplateElement} */
          target.content
        );
        this.c(html);
      }
      this.i(anchor);
    }
    /**
     * @param {string} html
     * @returns {void}
     */
    h(html) {
      this.e.innerHTML = html;
      this.n = Array.from(
        this.e.nodeName === "TEMPLATE" ? this.e.content.childNodes : this.e.childNodes
      );
    }
    /**
     * @returns {void} */
    i(anchor) {
      for (let i = 0; i < this.n.length; i += 1) {
        insert(this.t, this.n[i], anchor);
      }
    }
    /**
     * @param {string} html
     * @returns {void}
     */
    p(html) {
      this.d();
      this.h(html);
      this.i(this.a);
    }
    /**
     * @returns {void} */
    d() {
      this.n.forEach(detach);
    }
  }
  class HtmlTagHydration extends HtmlTag {
    constructor(is_svg2 = false, claimed_nodes) {
      super(is_svg2);
      /** @type {Element[]} hydration claimed nodes */
      __publicField(this, "l");
      this.e = this.n = null;
      this.l = claimed_nodes;
    }
    /**
     * @param {string} html
     * @returns {void}
     */
    c(html) {
      if (this.l) {
        this.n = this.l;
      } else {
        super.c(html);
      }
    }
    /**
     * @returns {void} */
    i(anchor) {
      for (let i = 0; i < this.n.length; i += 1) {
        insert_hydration(this.t, this.n[i], anchor);
      }
    }
  }
  function attribute_to_object(attributes) {
    const result = {};
    for (const attribute of attributes) {
      result[attribute.name] = attribute.value;
    }
    return result;
  }
  const escaped = {
    '"': "&quot;",
    "&": "&amp;",
    "<": "&lt;"
  };
  const regex_attribute_characters_to_escape = /["&<]/g;
  function escape_attribute(attribute) {
    return String(attribute).replace(regex_attribute_characters_to_escape, (match) => escaped[match]);
  }
  function stringify_spread(attributes) {
    let str = " ";
    for (const key in attributes) {
      if (attributes[key] != null) {
        str += `${key}="${escape_attribute(attributes[key])}" `;
      }
    }
    return str;
  }
  function get_custom_elements_slots(element2) {
    const result = {};
    element2.childNodes.forEach(
      /** @param {Element} node */
      (node) => {
        result[node.slot || "default"] = true;
      }
    );
    return result;
  }
  function construct_svelte_component(component, props) {
    return new component(props);
  }
  const managed_styles = /* @__PURE__ */ new Map();
  let active = 0;
  function hash(str) {
    let hash2 = 5381;
    let i = str.length;
    while (i--) hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
    return hash2 >>> 0;
  }
  function create_style_information(doc, node) {
    const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
    managed_styles.set(doc, info);
    return info;
  }
  function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = "{\n";
    for (let p = 0; p <= 1; p += step) {
      const t = a + (b - a) * ease(p);
      keyframes += p * 100 + `%{${fn(t, 1 - t)}}
`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = get_root_for_style(node);
    const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
    if (!rules[name]) {
      rules[name] = true;
      stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || "";
    node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
  }
  function delete_rule(node, name) {
    const previous = (node.style.animation || "").split(", ");
    const next = previous.filter(
      name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1
      // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
      node.style.animation = next.join(", ");
      active -= deleted;
      if (!active) clear_rules();
    }
  }
  function clear_rules() {
    raf(() => {
      if (active) return;
      managed_styles.forEach((info) => {
        const { ownerNode } = info.stylesheet;
        if (ownerNode) detach(ownerNode);
      });
      managed_styles.clear();
    });
  }
  function create_animation(node, from, fn, params) {
    if (!from) return noop;
    const to = node.getBoundingClientRect();
    if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
      return noop;
    const {
      delay = 0,
      duration = 300,
      easing = identity,
      // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
      start: start_time = now() + delay,
      // @ts-ignore todo:
      end = start_time + duration,
      tick: tick2 = noop,
      css
    } = fn(node, { from, to }, params);
    let running = true;
    let started = false;
    let name;
    function start() {
      if (css) {
        name = create_rule(node, 0, 1, duration, delay, easing, css);
      }
      if (!delay) {
        started = true;
      }
    }
    function stop() {
      if (css) delete_rule(node, name);
      running = false;
    }
    loop((now2) => {
      if (!started && now2 >= start_time) {
        started = true;
      }
      if (started && now2 >= end) {
        tick2(1, 0);
        stop();
      }
      if (!running) {
        return false;
      }
      if (started) {
        const p = now2 - start_time;
        const t = 0 + 1 * easing(p / duration);
        tick2(t, 1 - t);
      }
      return true;
    });
    start();
    tick2(0, 1);
    return stop;
  }
  function fix_position(node) {
    const style = getComputedStyle(node);
    if (style.position !== "absolute" && style.position !== "fixed") {
      const { width, height } = style;
      const a = node.getBoundingClientRect();
      node.style.position = "absolute";
      node.style.width = width;
      node.style.height = height;
      add_transform(node, a);
    }
  }
  function add_transform(node, a) {
    const b = node.getBoundingClientRect();
    if (a.left !== b.left || a.top !== b.top) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;
      node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
    }
  }
  let current_component;
  function set_current_component(component) {
    current_component = component;
  }
  function get_current_component() {
    if (!current_component) throw new Error("Function called outside component initialization");
    return current_component;
  }
  function beforeUpdate(fn) {
    get_current_component().$$.before_update.push(fn);
  }
  function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
  }
  function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
  }
  function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
  }
  function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail, { cancelable = false } = {}) => {
      const callbacks = component.$$.callbacks[type];
      if (callbacks) {
        const event = custom_event(
          /** @type {string} */
          type,
          detail,
          { cancelable }
        );
        callbacks.slice().forEach((fn) => {
          fn.call(component, event);
        });
        return !event.defaultPrevented;
      }
      return true;
    };
  }
  function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
    return context;
  }
  function getContext(key) {
    return get_current_component().$$.context.get(key);
  }
  function getAllContexts() {
    return get_current_component().$$.context;
  }
  function hasContext(key) {
    return get_current_component().$$.context.has(key);
  }
  function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
      callbacks.slice().forEach((fn) => fn.call(this, event));
    }
  }
  const dirty_components = [];
  const intros = { enabled: false };
  const binding_callbacks = [];
  let render_callbacks = [];
  const flush_callbacks = [];
  const resolved_promise = /* @__PURE__ */ Promise.resolve();
  let update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function tick() {
    schedule_update();
    return resolved_promise;
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  function add_flush_callback(fn) {
    flush_callbacks.push(fn);
  }
  const seen_callbacks = /* @__PURE__ */ new Set();
  let flushidx = 0;
  function flush() {
    if (flushidx !== 0) {
      return;
    }
    const saved_component = current_component;
    do {
      try {
        while (flushidx < dirty_components.length) {
          const component = dirty_components[flushidx];
          flushidx++;
          set_current_component(component);
          update(component.$$);
        }
      } catch (e) {
        dirty_components.length = 0;
        flushidx = 0;
        throw e;
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length) binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  function flush_render_callbacks(fns) {
    const filtered = [];
    const targets = [];
    render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
    targets.forEach((c) => c());
    render_callbacks = filtered;
  }
  let promise;
  function wait() {
    if (!promise) {
      promise = Promise.resolve();
      promise.then(() => {
        promise = null;
      });
    }
    return promise;
  }
  function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
  }
  const outroing = /* @__PURE__ */ new Set();
  let outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros
      // parent group
    };
  }
  function check_outros() {
    if (!outros.r) {
      run_all(outros.c);
    }
    outros = outros.p;
  }
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  function transition_out(block, local, detach2, callback) {
    if (block && block.o) {
      if (outroing.has(block)) return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach2) block.d(1);
          callback();
        }
      });
      block.o(local);
    } else if (callback) {
      callback();
    }
  }
  const null_transition = { duration: 0 };
  function create_in_transition(node, fn, params) {
    const options = { direction: "in" };
    let config = fn(node, params, options);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
      if (animation_name) delete_rule(node, animation_name);
    }
    function go() {
      const {
        delay = 0,
        duration = 300,
        easing = identity,
        tick: tick2 = noop,
        css
      } = config || null_transition;
      if (css) animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
      tick2(0, 1);
      const start_time = now() + delay;
      const end_time = start_time + duration;
      if (task) task.abort();
      running = true;
      add_render_callback(() => dispatch(node, true, "start"));
      task = loop((now2) => {
        if (running) {
          if (now2 >= end_time) {
            tick2(1, 0);
            dispatch(node, true, "end");
            cleanup();
            return running = false;
          }
          if (now2 >= start_time) {
            const t = easing((now2 - start_time) / duration);
            tick2(t, 1 - t);
          }
        }
        return running;
      });
    }
    let started = false;
    return {
      start() {
        if (started) return;
        started = true;
        delete_rule(node);
        if (is_function(config)) {
          config = config(options);
          wait().then(go);
        } else {
          go();
        }
      },
      invalidate() {
        started = false;
      },
      end() {
        if (running) {
          cleanup();
          running = false;
        }
      }
    };
  }
  function create_out_transition(node, fn, params) {
    const options = { direction: "out" };
    let config = fn(node, params, options);
    let running = true;
    let animation_name;
    const group = outros;
    group.r += 1;
    let original_inert_value;
    function go() {
      const {
        delay = 0,
        duration = 300,
        easing = identity,
        tick: tick2 = noop,
        css
      } = config || null_transition;
      if (css) animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
      const start_time = now() + delay;
      const end_time = start_time + duration;
      add_render_callback(() => dispatch(node, false, "start"));
      if ("inert" in node) {
        original_inert_value = /** @type {HTMLElement} */
        node.inert;
        node.inert = true;
      }
      loop((now2) => {
        if (running) {
          if (now2 >= end_time) {
            tick2(0, 1);
            dispatch(node, false, "end");
            if (!--group.r) {
              run_all(group.c);
            }
            return false;
          }
          if (now2 >= start_time) {
            const t = easing((now2 - start_time) / duration);
            tick2(1 - t, t);
          }
        }
        return running;
      });
    }
    if (is_function(config)) {
      wait().then(() => {
        config = config(options);
        go();
      });
    } else {
      go();
    }
    return {
      end(reset) {
        if (reset && "inert" in node) {
          node.inert = original_inert_value;
        }
        if (reset && config.tick) {
          config.tick(1, 0);
        }
        if (running) {
          if (animation_name) delete_rule(node, animation_name);
          running = false;
        }
      }
    };
  }
  function create_bidirectional_transition(node, fn, params, intro) {
    const options = { direction: "both" };
    let config = fn(node, params, options);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    let original_inert_value;
    function clear_animation() {
      if (animation_name) delete_rule(node, animation_name);
    }
    function init2(program, duration) {
      const d = (
        /** @type {Program['d']} */
        program.b - t
      );
      duration *= Math.abs(d);
      return {
        a: t,
        b: program.b,
        d,
        duration,
        start: program.start,
        end: program.start + duration,
        group: program.group
      };
    }
    function go(b) {
      const {
        delay = 0,
        duration = 300,
        easing = identity,
        tick: tick2 = noop,
        css
      } = config || null_transition;
      const program = {
        start: now() + delay,
        b
      };
      if (!b) {
        program.group = outros;
        outros.r += 1;
      }
      if ("inert" in node) {
        if (b) {
          if (original_inert_value !== void 0) {
            node.inert = original_inert_value;
          }
        } else {
          original_inert_value = /** @type {HTMLElement} */
          node.inert;
          node.inert = true;
        }
      }
      if (running_program || pending_program) {
        pending_program = program;
      } else {
        if (css) {
          clear_animation();
          animation_name = create_rule(node, t, b, duration, delay, easing, css);
        }
        if (b) tick2(0, 1);
        running_program = init2(program, duration);
        add_render_callback(() => dispatch(node, b, "start"));
        loop((now2) => {
          if (pending_program && now2 > pending_program.start) {
            running_program = init2(pending_program, duration);
            pending_program = null;
            dispatch(node, running_program.b, "start");
            if (css) {
              clear_animation();
              animation_name = create_rule(
                node,
                t,
                running_program.b,
                running_program.duration,
                0,
                easing,
                config.css
              );
            }
          }
          if (running_program) {
            if (now2 >= running_program.end) {
              tick2(t = running_program.b, 1 - t);
              dispatch(node, running_program.b, "end");
              if (!pending_program) {
                if (running_program.b) {
                  clear_animation();
                } else {
                  if (!--running_program.group.r) run_all(running_program.group.c);
                }
              }
              running_program = null;
            } else if (now2 >= running_program.start) {
              const p = now2 - running_program.start;
              t = running_program.a + running_program.d * easing(p / running_program.duration);
              tick2(t, 1 - t);
            }
          }
          return !!(running_program || pending_program);
        });
      }
    }
    return {
      run(b) {
        if (is_function(config)) {
          wait().then(() => {
            const opts = { direction: b ? "in" : "out" };
            config = config(opts);
            go(b);
          });
        } else {
          go(b);
        }
      },
      end() {
        clear_animation();
        running_program = pending_program = null;
      }
    };
  }
  function handle_promise(promise2, info) {
    const token = info.token = {};
    function update2(type, index, key, value) {
      if (info.token !== token) return;
      info.resolved = value;
      let child_ctx = info.ctx;
      if (key !== void 0) {
        child_ctx = child_ctx.slice();
        child_ctx[key] = value;
      }
      const block = type && (info.current = type)(child_ctx);
      let needs_flush = false;
      if (info.block) {
        if (info.blocks) {
          info.blocks.forEach((block2, i) => {
            if (i !== index && block2) {
              group_outros();
              transition_out(block2, 1, 1, () => {
                if (info.blocks[i] === block2) {
                  info.blocks[i] = null;
                }
              });
              check_outros();
            }
          });
        } else {
          info.block.d(1);
        }
        block.c();
        transition_in(block, 1);
        block.m(info.mount(), info.anchor);
        needs_flush = true;
      }
      info.block = block;
      if (info.blocks) info.blocks[index] = block;
      if (needs_flush) {
        flush();
      }
    }
    if (is_promise(promise2)) {
      const current_component2 = get_current_component();
      promise2.then(
        (value) => {
          set_current_component(current_component2);
          update2(info.then, 1, info.value, value);
          set_current_component(null);
        },
        (error) => {
          set_current_component(current_component2);
          update2(info.catch, 2, info.error, error);
          set_current_component(null);
          if (!info.hasCatch) {
            throw error;
          }
        }
      );
      if (info.current !== info.pending) {
        update2(info.pending, 0);
        return true;
      }
    } else {
      if (info.current !== info.then) {
        update2(info.then, 1, info.value, promise2);
        return true;
      }
      info.resolved = /** @type {T} */
      promise2;
    }
  }
  function update_await_block_branch(info, ctx, dirty) {
    const child_ctx = ctx.slice();
    const { resolved } = info;
    if (info.current === info.then) {
      child_ctx[info.value] = resolved;
    }
    if (info.current === info.catch) {
      child_ctx[info.error] = resolved;
    }
    info.block.p(child_ctx, dirty);
  }
  function ensure_array_like(array_like_or_iterator) {
    return (array_like_or_iterator == null ? void 0 : array_like_or_iterator.length) !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
  }
  function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
  }
  function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
      lookup.delete(block.key);
    });
  }
  function fix_and_destroy_block(block, lookup) {
    block.f();
    destroy_block(block, lookup);
  }
  function fix_and_outro_and_destroy_block(block, lookup) {
    block.f();
    outro_and_destroy_block(block, lookup);
  }
  function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block2, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--) old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = /* @__PURE__ */ new Map();
    const deltas = /* @__PURE__ */ new Map();
    const updates = [];
    i = n;
    while (i--) {
      const child_ctx = get_context(ctx, list, i);
      const key = get_key(child_ctx);
      let block = lookup.get(key);
      if (!block) {
        block = create_each_block2(key, child_ctx);
        block.c();
      } else if (dynamic) {
        updates.push(() => block.p(child_ctx, dirty));
      }
      new_lookup.set(key, new_blocks[i] = block);
      if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = /* @__PURE__ */ new Set();
    const did_move = /* @__PURE__ */ new Set();
    function insert2(block) {
      transition_in(block, 1);
      block.m(node, next);
      lookup.set(block.key, block);
      next = block.first;
      n--;
    }
    while (o && n) {
      const new_block = new_blocks[n - 1];
      const old_block = old_blocks[o - 1];
      const new_key = new_block.key;
      const old_key = old_block.key;
      if (new_block === old_block) {
        next = new_block.first;
        o--;
        n--;
      } else if (!new_lookup.has(old_key)) {
        destroy(old_block, lookup);
        o--;
      } else if (!lookup.has(new_key) || will_move.has(new_key)) {
        insert2(new_block);
      } else if (did_move.has(old_key)) {
        o--;
      } else if (deltas.get(new_key) > deltas.get(old_key)) {
        did_move.add(new_key);
        insert2(new_block);
      } else {
        will_move.add(old_key);
        o--;
      }
    }
    while (o--) {
      const old_block = old_blocks[o];
      if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
    }
    while (n) insert2(new_blocks[n - 1]);
    run_all(updates);
    return new_blocks;
  }
  function validate_each_keys(ctx, list, get_context, get_key) {
    const keys = /* @__PURE__ */ new Map();
    for (let i = 0; i < list.length; i++) {
      const key = get_key(get_context(ctx, list, i));
      if (keys.has(key)) {
        let value = "";
        try {
          value = `with value '${String(key)}' `;
        } catch (e) {
        }
        throw new Error(
          `Cannot have duplicate keys in a keyed each: Keys at index ${keys.get(
            key
          )} and ${i} ${value}are duplicates`
        );
      }
      keys.set(key, i);
    }
  }
  function get_spread_update(levels, updates) {
    const update2 = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
      const o = levels[i];
      const n = updates[i];
      if (n) {
        for (const key in o) {
          if (!(key in n)) to_null_out[key] = 1;
        }
        for (const key in n) {
          if (!accounted_for[key]) {
            update2[key] = n[key];
            accounted_for[key] = 1;
          }
        }
        levels[i] = n;
      } else {
        for (const key in o) {
          accounted_for[key] = 1;
        }
      }
    }
    for (const key in to_null_out) {
      if (!(key in update2)) update2[key] = void 0;
    }
    return update2;
  }
  function get_spread_object(spread_props) {
    return typeof spread_props === "object" && spread_props !== null ? spread_props : {};
  }
  const _boolean_attributes = (
    /** @type {const} */
    [
      "allowfullscreen",
      "allowpaymentrequest",
      "async",
      "autofocus",
      "autoplay",
      "checked",
      "controls",
      "default",
      "defer",
      "disabled",
      "formnovalidate",
      "hidden",
      "inert",
      "ismap",
      "loop",
      "multiple",
      "muted",
      "nomodule",
      "novalidate",
      "open",
      "playsinline",
      "readonly",
      "required",
      "reversed",
      "selected"
    ]
  );
  const boolean_attributes = /* @__PURE__ */ new Set([..._boolean_attributes]);
  const ATTR_REGEX = /[&"<]/g;
  const CONTENT_REGEX = /[&<]/g;
  function escape(value, is_attr = false) {
    const str = String(value);
    const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
    pattern.lastIndex = 0;
    let escaped2 = "";
    let last = 0;
    while (pattern.test(str)) {
      const i = pattern.lastIndex - 1;
      const ch = str[i];
      escaped2 += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === '"' ? "&quot;" : "&lt;");
      last = i + 1;
    }
    return escaped2 + str.substring(last);
  }
  const void_element_names = /^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;
  const html_element_names = /^(?:a|abbr|address|area|article|aside|audio|b|base|bdi|bdo|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|data|datalist|dd|del|details|dfn|dialog|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hr|html|i|iframe|img|input|ins|kbd|label|legend|li|link|main|map|mark|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|param|picture|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr)$/;
  const svg = /^(?:altGlyph|altGlyphDef|altGlyphItem|animate|animateColor|animateMotion|animateTransform|circle|clipPath|color-profile|cursor|defs|desc|discard|ellipse|feBlend|feColorMatrix|feComponentTransfer|feComposite|feConvolveMatrix|feDiffuseLighting|feDisplacementMap|feDistantLight|feDropShadow|feFlood|feFuncA|feFuncB|feFuncG|feFuncR|feGaussianBlur|feImage|feMerge|feMergeNode|feMorphology|feOffset|fePointLight|feSpecularLighting|feSpotLight|feTile|feTurbulence|filter|font|font-face|font-face-format|font-face-name|font-face-src|font-face-uri|foreignObject|g|glyph|glyphRef|hatch|hatchpath|hkern|image|line|linearGradient|marker|mask|mesh|meshgradient|meshpatch|meshrow|metadata|missing-glyph|mpath|path|pattern|polygon|polyline|radialGradient|rect|set|solidcolor|stop|svg|switch|symbol|text|textPath|tref|tspan|unknown|use|view|vkern)$/;
  function is_void(name) {
    return void_element_names.test(name) || name.toLowerCase() === "!doctype";
  }
  function is_html(name) {
    return html_element_names.test(name);
  }
  function is_svg(name) {
    return svg.test(name);
  }
  const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
  function spread(args, attrs_to_add) {
    const attributes = Object.assign({}, ...args);
    if (attrs_to_add) {
      const classes_to_add = attrs_to_add.classes;
      const styles_to_add = attrs_to_add.styles;
      if (classes_to_add) {
        if (attributes.class == null) {
          attributes.class = classes_to_add;
        } else {
          attributes.class += " " + classes_to_add;
        }
      }
      if (styles_to_add) {
        if (attributes.style == null) {
          attributes.style = style_object_to_string(styles_to_add);
        } else {
          attributes.style = style_object_to_string(
            merge_ssr_styles(attributes.style, styles_to_add)
          );
        }
      }
    }
    let str = "";
    Object.keys(attributes).forEach((name) => {
      if (invalid_attribute_name_character.test(name)) return;
      const value = attributes[name];
      if (value === true) str += " " + name;
      else if (boolean_attributes.has(name.toLowerCase())) {
        if (value) str += " " + name;
      } else if (value != null) {
        str += ` ${name}="${value}"`;
      }
    });
    return str;
  }
  function merge_ssr_styles(style_attribute, style_directive) {
    const style_object = {};
    for (const individual_style of style_attribute.split(";")) {
      const colon_index = individual_style.indexOf(":");
      const name = individual_style.slice(0, colon_index).trim();
      const value = individual_style.slice(colon_index + 1).trim();
      if (!name) continue;
      style_object[name] = value;
    }
    for (const name in style_directive) {
      const value = style_directive[name];
      if (value) {
        style_object[name] = value;
      } else {
        delete style_object[name];
      }
    }
    return style_object;
  }
  function escape_attribute_value(value) {
    const should_escape = typeof value === "string" || value && typeof value === "object";
    return should_escape ? escape(value, true) : value;
  }
  function escape_object(obj) {
    const result = {};
    for (const key in obj) {
      result[key] = escape_attribute_value(obj[key]);
    }
    return result;
  }
  function each(items, fn) {
    items = ensure_array_like(items);
    let str = "";
    for (let i = 0; i < items.length; i += 1) {
      str += fn(items[i], i);
    }
    return str;
  }
  const missing_component = {
    $$render: () => ""
  };
  function validate_component(component, name) {
    if (!component || !component.$$render) {
      if (name === "svelte:component") name += " this={...}";
      throw new Error(
        `<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules. Otherwise you may need to fix a <${name}>.`
      );
    }
    return component;
  }
  function debug(file, line, column, values) {
    console.log(`{@debug} ${file ? file + " " : ""}(${line}:${column})`);
    console.log(values);
    return "";
  }
  let on_destroy;
  function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots, context) {
      const parent_component = current_component;
      const $$ = {
        on_destroy,
        context: new Map(context || (parent_component ? parent_component.$$.context : [])),
        // these will be immediately discarded
        on_mount: [],
        before_update: [],
        after_update: [],
        callbacks: blank_object()
      };
      set_current_component({ $$ });
      const html = fn(result, props, bindings, slots);
      set_current_component(parent_component);
      return html;
    }
    return {
      render: (props = {}, { $$slots = {}, context = /* @__PURE__ */ new Map() } = {}) => {
        on_destroy = [];
        const result = { title: "", head: "", css: /* @__PURE__ */ new Set() };
        const html = $$render(result, props, {}, $$slots, context);
        run_all(on_destroy);
        return {
          html,
          css: {
            code: Array.from(result.css).map((css) => css.code).join("\n"),
            map: null
            // TODO
          },
          head: result.title + result.head
        };
      },
      $$render
    };
  }
  function add_attribute(name, value, boolean) {
    if (value == null || boolean && !value) return "";
    const assignment = boolean && value === true ? "" : `="${escape(value, true)}"`;
    return ` ${name}${assignment}`;
  }
  function add_classes(classes) {
    return classes ? ` class="${classes}"` : "";
  }
  function style_object_to_string(style_object) {
    return Object.keys(style_object).filter((key) => style_object[key] != null && style_object[key] !== "").map((key) => `${key}: ${escape_attribute_value(style_object[key])};`).join(" ");
  }
  function add_styles(style_object) {
    const styles = style_object_to_string(style_object);
    return styles ? ` style="${styles}"` : "";
  }
  function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== void 0) {
      component.$$.bound[index] = callback;
      callback(component.$$.ctx[index]);
    }
  }
  function create_component(block) {
    block && block.c();
  }
  function claim_component(block, parent_nodes) {
    block && block.l(parent_nodes);
  }
  function mount_component(component, target, anchor) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    add_render_callback(() => {
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      flush_render_callbacks($$.after_update);
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance2, create_fragment2, not_equal2, props, append_styles2 = null, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: [],
      // state
      props,
      update: noop,
      not_equal: not_equal2,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      // everything else
      callbacks: blank_object(),
      dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles2 && append_styles2($$.root);
    let ready = false;
    $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal2($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        start_hydrating();
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro) transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor);
      end_hydrating();
      flush();
    }
    set_current_component(parent_component);
  }
  let SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor($$componentCtor, $$slots, use_shadow_dom) {
        super();
        /** The Svelte component constructor */
        __publicField(this, "$$ctor");
        /** Slots */
        __publicField(this, "$$s");
        /** The Svelte component instance */
        __publicField(this, "$$c");
        /** Whether or not the custom element is connected */
        __publicField(this, "$$cn", false);
        /** Component props data */
        __publicField(this, "$$d", {});
        /** `true` if currently in the process of reflecting component props back to attributes */
        __publicField(this, "$$r", false);
        /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
        __publicField(this, "$$p_d", {});
        /** @type {Record<string, Function[]>} Event listeners */
        __publicField(this, "$$l", {});
        /** @type {Map<Function, Function>} Event listener unsubscribe functions */
        __publicField(this, "$$l_u", /* @__PURE__ */ new Map());
        this.$$ctor = $$componentCtor;
        this.$$s = $$slots;
        if (use_shadow_dom) {
          this.attachShadow({ mode: "open" });
        }
      }
      addEventListener(type, listener, options) {
        this.$$l[type] = this.$$l[type] || [];
        this.$$l[type].push(listener);
        if (this.$$c) {
          const unsub = this.$$c.$on(type, listener);
          this.$$l_u.set(listener, unsub);
        }
        super.addEventListener(type, listener, options);
      }
      removeEventListener(type, listener, options) {
        super.removeEventListener(type, listener, options);
        if (this.$$c) {
          const unsub = this.$$l_u.get(listener);
          if (unsub) {
            unsub();
            this.$$l_u.delete(listener);
          }
        }
        if (this.$$l[type]) {
          const idx = this.$$l[type].indexOf(listener);
          if (idx >= 0) {
            this.$$l[type].splice(idx, 1);
          }
        }
      }
      async connectedCallback() {
        this.$$cn = true;
        if (!this.$$c) {
          let create_slot2 = function(name) {
            return () => {
              let node;
              const obj = {
                c: function create() {
                  node = element("slot");
                  if (name !== "default") {
                    attr(node, "name", name);
                  }
                },
                /**
                 * @param {HTMLElement} target
                 * @param {HTMLElement} [anchor]
                 */
                m: function mount(target, anchor) {
                  insert(target, node, anchor);
                },
                d: function destroy(detaching) {
                  if (detaching) {
                    detach(node);
                  }
                }
              };
              return obj;
            };
          };
          await Promise.resolve();
          if (!this.$$cn || this.$$c) {
            return;
          }
          const $$slots = {};
          const existing_slots = get_custom_elements_slots(this);
          for (const name of this.$$s) {
            if (name in existing_slots) {
              $$slots[name] = [create_slot2(name)];
            }
          }
          for (const attribute of this.attributes) {
            const name = this.$$g_p(attribute.name);
            if (!(name in this.$$d)) {
              this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, "toProp");
            }
          }
          for (const key in this.$$p_d) {
            if (!(key in this.$$d) && this[key] !== void 0) {
              this.$$d[key] = this[key];
              delete this[key];
            }
          }
          this.$$c = new this.$$ctor({
            target: this.shadowRoot || this,
            props: {
              ...this.$$d,
              $$slots,
              $$scope: {
                ctx: []
              }
            }
          });
          const reflect_attributes = () => {
            this.$$r = true;
            for (const key in this.$$p_d) {
              this.$$d[key] = this.$$c.$$.ctx[this.$$c.$$.props[key]];
              if (this.$$p_d[key].reflect) {
                const attribute_value = get_custom_element_value(
                  key,
                  this.$$d[key],
                  this.$$p_d,
                  "toAttribute"
                );
                if (attribute_value == null) {
                  this.removeAttribute(this.$$p_d[key].attribute || key);
                } else {
                  this.setAttribute(this.$$p_d[key].attribute || key, attribute_value);
                }
              }
            }
            this.$$r = false;
          };
          this.$$c.$$.after_update.push(reflect_attributes);
          reflect_attributes();
          for (const type in this.$$l) {
            for (const listener of this.$$l[type]) {
              const unsub = this.$$c.$on(type, listener);
              this.$$l_u.set(listener, unsub);
            }
          }
          this.$$l = {};
        }
      }
      // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
      // and setting attributes through setAttribute etc, this is helpful
      attributeChangedCallback(attr2, _oldValue, newValue) {
        var _a;
        if (this.$$r) return;
        attr2 = this.$$g_p(attr2);
        this.$$d[attr2] = get_custom_element_value(attr2, newValue, this.$$p_d, "toProp");
        (_a = this.$$c) == null ? void 0 : _a.$set({ [attr2]: this.$$d[attr2] });
      }
      disconnectedCallback() {
        this.$$cn = false;
        Promise.resolve().then(() => {
          if (!this.$$cn && this.$$c) {
            this.$$c.$destroy();
            this.$$c = void 0;
          }
        });
      }
      $$g_p(attribute_name) {
        return Object.keys(this.$$p_d).find(
          (key) => this.$$p_d[key].attribute === attribute_name || !this.$$p_d[key].attribute && key.toLowerCase() === attribute_name
        ) || attribute_name;
      }
    };
  }
  function get_custom_element_value(prop, value, props_definition, transform) {
    var _a;
    const type = (_a = props_definition[prop]) == null ? void 0 : _a.type;
    value = type === "Boolean" && typeof value !== "boolean" ? value != null : value;
    if (!transform || !props_definition[prop]) {
      return value;
    } else if (transform === "toAttribute") {
      switch (type) {
        case "Object":
        case "Array":
          return value == null ? null : JSON.stringify(value);
        case "Boolean":
          return value ? "" : null;
        case "Number":
          return value == null ? null : value;
        default:
          return value;
      }
    } else {
      switch (type) {
        case "Object":
        case "Array":
          return value && JSON.parse(value);
        case "Boolean":
          return value;
        case "Number":
          return value != null ? +value : value;
        default:
          return value;
      }
    }
  }
  function create_custom_element(Component, props_definition, slots, accessors, use_shadow_dom, extend) {
    let Class = class extends SvelteElement {
      constructor() {
        super(Component, slots, use_shadow_dom);
        this.$$p_d = props_definition;
      }
      static get observedAttributes() {
        return Object.keys(props_definition).map(
          (key) => (props_definition[key].attribute || key).toLowerCase()
        );
      }
    };
    Object.keys(props_definition).forEach((prop) => {
      Object.defineProperty(Class.prototype, prop, {
        get() {
          return this.$$c && prop in this.$$c ? this.$$c[prop] : this.$$d[prop];
        },
        set(value) {
          var _a;
          value = get_custom_element_value(prop, value, props_definition);
          this.$$d[prop] = value;
          (_a = this.$$c) == null ? void 0 : _a.$set({ [prop]: value });
        }
      });
    });
    accessors.forEach((accessor) => {
      Object.defineProperty(Class.prototype, accessor, {
        get() {
          var _a;
          return (_a = this.$$c) == null ? void 0 : _a[accessor];
        }
      });
    });
    if (extend) {
      Class = extend(Class);
    }
    Component.element = /** @type {any} */
    Class;
    return Class;
  }
  class SvelteComponent {
    constructor() {
      /**
       * ### PRIVATE API
       *
       * Do not use, may change at any time
       *
       * @type {any}
       */
      __publicField(this, "$$");
      /**
       * ### PRIVATE API
       *
       * Do not use, may change at any time
       *
       * @type {any}
       */
      __publicField(this, "$$set");
    }
    /** @returns {void} */
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    /**
     * @template {Extract<keyof Events, string>} K
     * @param {K} type
     * @param {((e: Events[K]) => void) | null | undefined} callback
     * @returns {() => void}
     */
    $on(type, callback) {
      if (!is_function(callback)) {
        return noop;
      }
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
      };
    }
    /**
     * @param {Partial<Props>} props
     * @returns {void}
     */
    $set(props) {
      if (this.$$set && !is_empty(props)) {
        this.$$.skip_bound = true;
        this.$$set(props);
        this.$$.skip_bound = false;
      }
    }
  }
  const VERSION = "4.2.20";
  const PUBLIC_VERSION = "4";
  function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
  }
  function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
  }
  function append_hydration_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append_hydration(target, node);
  }
  function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
  }
  function insert_hydration_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert_hydration(target, node, anchor);
  }
  function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
  }
  function detach_between_dev(before, after) {
    while (before.nextSibling && before.nextSibling !== after) {
      detach_dev(before.nextSibling);
    }
  }
  function detach_before_dev(after) {
    while (after.previousSibling) {
      detach_dev(after.previousSibling);
    }
  }
  function detach_after_dev(before) {
    while (before.nextSibling) {
      detach_dev(before.nextSibling);
    }
  }
  function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
    const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default) modifiers.push("preventDefault");
    if (has_stop_propagation) modifiers.push("stopPropagation");
    if (has_stop_immediate_propagation) modifiers.push("stopImmediatePropagation");
    dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
      dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
      dispose();
    };
  }
  function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null) dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
  }
  function prop_dev(node, property, value) {
    node[property] = value;
    dispatch_dev("SvelteDOMSetProperty", { node, property, value });
  }
  function dataset_dev(node, property, value) {
    node.dataset[property] = value;
    dispatch_dev("SvelteDOMSetDataset", { node, property, value });
  }
  function set_data_dev(text2, data) {
    data = "" + data;
    if (text2.data === data) return;
    dispatch_dev("SvelteDOMSetData", { node: text2, data });
    text2.data = /** @type {string} */
    data;
  }
  function set_data_contenteditable_dev(text2, data) {
    data = "" + data;
    if (text2.wholeText === data) return;
    dispatch_dev("SvelteDOMSetData", { node: text2, data });
    text2.data = /** @type {string} */
    data;
  }
  function set_data_maybe_contenteditable_dev(text2, data, attr_value) {
    if (~contenteditable_truthy_values.indexOf(attr_value)) {
      set_data_contenteditable_dev(text2, data);
    } else {
      set_data_dev(text2, data);
    }
  }
  function ensure_array_like_dev(arg) {
    if (typeof arg !== "string" && !(arg && typeof arg === "object" && "length" in arg) && !(typeof Symbol === "function" && arg && Symbol.iterator in arg)) {
      throw new Error("{#each} only works with iterable values.");
    }
    return ensure_array_like(arg);
  }
  function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
      if (!~keys.indexOf(slot_key)) {
        console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
      }
    }
  }
  function validate_dynamic_element(tag) {
    const is_string = typeof tag === "string";
    if (tag && !is_string) {
      throw new Error('<svelte:element> expects "this" attribute to be a string.');
    }
  }
  function validate_void_dynamic_element(tag) {
    if (tag && is_void(tag)) {
      console.warn(`<svelte:element this="${tag}"> is self-closing and cannot have content.`);
    }
  }
  function construct_svelte_component_dev(component, props) {
    const error_message = "this={...} of <svelte:component> should specify a Svelte component.";
    try {
      const instance2 = new component(props);
      if (!instance2.$$ || !instance2.$set || !instance2.$on || !instance2.$destroy) {
        throw new Error(error_message);
      }
      return instance2;
    } catch (err) {
      const { message } = err;
      if (typeof message === "string" && message.indexOf("is not a constructor") !== -1) {
        throw new Error(error_message);
      } else {
        throw err;
      }
    }
  }
  class SvelteComponentDev extends SvelteComponent {
    /** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
    constructor(options) {
      if (!options || !options.target && !options.$$inline) {
        throw new Error("'target' is a required option");
      }
      super();
      /**
       * For type checking capabilities only.
       * Does not exist at runtime.
       * ### DO NOT USE!
       *
       * @type {Props}
       */
      __publicField(this, "$$prop_def");
      /**
       * For type checking capabilities only.
       * Does not exist at runtime.
       * ### DO NOT USE!
       *
       * @type {Events}
       */
      __publicField(this, "$$events_def");
      /**
       * For type checking capabilities only.
       * Does not exist at runtime.
       * ### DO NOT USE!
       *
       * @type {Slots}
       */
      __publicField(this, "$$slot_def");
    }
    /** @returns {void} */
    $destroy() {
      super.$destroy();
      this.$destroy = () => {
        console.warn("Component was already destroyed");
      };
    }
    /** @returns {void} */
    $capture_state() {
    }
    /** @returns {void} */
    $inject_state() {
    }
  }
  class SvelteComponentTyped extends SvelteComponentDev {
  }
  function loop_guard(timeout) {
    const start = Date.now();
    return () => {
      if (Date.now() - start > timeout) {
        throw new Error("Infinite loop detected");
      }
    };
  }
  if (typeof window !== "undefined")
    (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
  function get_each_context(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[15] = list[i];
    return child_ctx;
  }
  function get_each_context_1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[18] = list[i];
    child_ctx[20] = i;
    return child_ctx;
  }
  function create_each_block_1(ctx) {
    let button;
    let t0_value = (
      /*i*/
      ctx[20] === 0 ? "Cantrips" : `Lvl ${/*i*/
      ctx[20]}`
    );
    let t0;
    let t1;
    let mounted;
    let dispose;
    function click_handler() {
      return (
        /*click_handler*/
        ctx[9](
          /*i*/
          ctx[20]
        )
      );
    }
    return {
      c() {
        button = element("button");
        t0 = text(t0_value);
        t1 = space();
        attr(button, "type", "button");
        set_style(button, "padding", "6px 12px");
        set_style(button, "border", "1px solid #ccc");
        set_style(button, "border-bottom", "none");
        set_style(button, "border-radius", "4px 4px 0 0");
        set_style(button, "font-weight", "bold");
        set_style(button, "cursor", "pointer");
        set_style(button, "font-size", "11px");
        set_style(button, "white-space", "nowrap");
        set_style(
          button,
          "background",
          /*activeTab*/
          ctx[1] === /*i*/
          ctx[20] ? "#7a2214" : "#eee"
        );
        set_style(
          button,
          "color",
          /*activeTab*/
          ctx[1] === /*i*/
          ctx[20] ? "#fff" : "#333"
        );
      },
      m(target, anchor) {
        insert(target, button, anchor);
        append(button, t0);
        append(button, t1);
        if (!mounted) {
          dispose = listen(button, "click", click_handler);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & /*activeTab*/
        2) {
          set_style(
            button,
            "background",
            /*activeTab*/
            ctx[1] === /*i*/
            ctx[20] ? "#7a2214" : "#eee"
          );
        }
        if (dirty & /*activeTab*/
        2) {
          set_style(
            button,
            "color",
            /*activeTab*/
            ctx[1] === /*i*/
            ctx[20] ? "#fff" : "#333"
          );
        }
      },
      d(detaching) {
        if (detaching) {
          detach(button);
        }
        mounted = false;
        dispose();
      }
    };
  }
  function create_else_block(ctx) {
    let each_1_anchor;
    let each_value = ensure_array_like(
      /*visibleSpells*/
      ctx[8]
    );
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(target, anchor);
          }
        }
        insert(target, each_1_anchor, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & /*visibleSpells, window, chosenCantrips, stats, activeTab, chosenLeveledByTier, totalLeveledChosen*/
        366) {
          each_value = ensure_array_like(
            /*visibleSpells*/
            ctx2[8]
          );
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
      },
      d(detaching) {
        if (detaching) {
          detach(each_1_anchor);
        }
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function create_if_block_1(ctx) {
    let div;
    return {
      c() {
        div = element("div");
        div.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Indexing configuration lists...`;
        set_style(div, "text-align", "center");
        set_style(div, "color", "#999");
        set_style(div, "padding-top", "60px");
        set_style(div, "font-style", "italic");
        set_style(div, "font-size", "12px");
      },
      m(target, anchor) {
        insert(target, div, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(div);
        }
      }
    };
  }
  function create_if_block(ctx) {
    let div;
    let i;
    let t0;
    let h4;
    let t1;
    let t2;
    let t3;
    return {
      c() {
        div = element("div");
        i = element("i");
        t0 = space();
        h4 = element("h4");
        t1 = text("Level ");
        t2 = text(
          /*activeTab*/
          ctx[1]
        );
        t3 = text(" Spells Locked");
        attr(i, "class", "fas fa-lock");
        set_style(i, "font-size", "24px");
        set_style(i, "margin-bottom", "8px");
        set_style(h4, "margin", "0");
        set_style(div, "text-align", "center");
        set_style(div, "color", "#888");
        set_style(div, "padding-top", "50px");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, i);
        append(div, t0);
        append(div, h4);
        append(h4, t1);
        append(h4, t2);
        append(h4, t3);
      },
      p(ctx2, dirty) {
        if (dirty & /*activeTab*/
        2) set_data(
          t2,
          /*activeTab*/
          ctx2[1]
        );
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
      }
    };
  }
  function create_else_block_1(ctx) {
    let input;
    let input_value_value;
    let value_has_changed = false;
    let input_disabled_value;
    let binding_group;
    let mounted;
    let dispose;
    binding_group = init_binding_group(
      /*$$binding_groups*/
      ctx[11][1]
    );
    return {
      c() {
        input = element("input");
        attr(input, "type", "checkbox");
        input.__value = input_value_value = /*spell*/
        ctx[15].uuid;
        set_input_value(input, input.__value);
        input.disabled = input_disabled_value = !/*chosenLeveledByTier*/
        ctx[3][
          /*activeTab*/
          ctx[1]
        ].includes(
          /*spell*/
          ctx[15].uuid
        ) && /*totalLeveledChosen*/
        ctx[6] >= /*stats*/
        ctx[5].spellsMax;
        set_style(input, "margin-right", "12px");
        set_style(input, "cursor", "pointer");
        binding_group.p(input);
      },
      m(target, anchor) {
        insert(target, input, anchor);
        input.checked = ~/*chosenLeveledByTier*/
        (ctx[3][
          /*activeTab*/
          ctx[1]
        ] || []).indexOf(input.__value);
        if (!mounted) {
          dispose = listen(
            input,
            "change",
            /*input_change_handler_1*/
            ctx[12]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & /*visibleSpells*/
        256 && input_value_value !== (input_value_value = /*spell*/
        ctx2[15].uuid)) {
          input.__value = input_value_value;
          set_input_value(input, input.__value);
          value_has_changed = true;
        }
        if (dirty & /*chosenLeveledByTier, activeTab, visibleSpells, totalLeveledChosen, stats*/
        362 && input_disabled_value !== (input_disabled_value = !/*chosenLeveledByTier*/
        ctx2[3][
          /*activeTab*/
          ctx2[1]
        ].includes(
          /*spell*/
          ctx2[15].uuid
        ) && /*totalLeveledChosen*/
        ctx2[6] >= /*stats*/
        ctx2[5].spellsMax)) {
          input.disabled = input_disabled_value;
        }
        if (value_has_changed || dirty & /*chosenLeveledByTier, activeTab, visibleSpells*/
        266) {
          input.checked = ~/*chosenLeveledByTier*/
          (ctx2[3][
            /*activeTab*/
            ctx2[1]
          ] || []).indexOf(input.__value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(input);
        }
        binding_group.r();
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_2(ctx) {
    let input;
    let input_value_value;
    let value_has_changed = false;
    let input_disabled_value;
    let binding_group;
    let mounted;
    let dispose;
    binding_group = init_binding_group(
      /*$$binding_groups*/
      ctx[11][0]
    );
    return {
      c() {
        input = element("input");
        attr(input, "type", "checkbox");
        input.__value = input_value_value = /*spell*/
        ctx[15].uuid;
        set_input_value(input, input.__value);
        input.disabled = input_disabled_value = !/*chosenCantrips*/
        ctx[2].includes(
          /*spell*/
          ctx[15].uuid
        ) && /*chosenCantrips*/
        ctx[2].length >= /*stats*/
        ctx[5].cantripsMax;
        set_style(input, "margin-right", "12px");
        set_style(input, "cursor", "pointer");
        binding_group.p(input);
      },
      m(target, anchor) {
        insert(target, input, anchor);
        input.checked = ~/*chosenCantrips*/
        (ctx[2] || []).indexOf(input.__value);
        if (!mounted) {
          dispose = listen(
            input,
            "change",
            /*input_change_handler*/
            ctx[10]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & /*visibleSpells*/
        256 && input_value_value !== (input_value_value = /*spell*/
        ctx2[15].uuid)) {
          input.__value = input_value_value;
          set_input_value(input, input.__value);
          value_has_changed = true;
        }
        if (dirty & /*chosenCantrips, visibleSpells, stats*/
        292 && input_disabled_value !== (input_disabled_value = !/*chosenCantrips*/
        ctx2[2].includes(
          /*spell*/
          ctx2[15].uuid
        ) && /*chosenCantrips*/
        ctx2[2].length >= /*stats*/
        ctx2[5].cantripsMax)) {
          input.disabled = input_disabled_value;
        }
        if (value_has_changed || dirty & /*chosenCantrips, visibleSpells*/
        260) {
          input.checked = ~/*chosenCantrips*/
          (ctx2[2] || []).indexOf(input.__value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(input);
        }
        binding_group.r();
        mounted = false;
        dispose();
      }
    };
  }
  function create_each_block(ctx) {
    let div1;
    let div0;
    let t0;
    let img;
    let img_src_value;
    let t1;
    let span;
    let t2_value = (
      /*spell*/
      ctx[15].name + ""
    );
    let t2;
    let t3;
    let button;
    let t5;
    let div1_data_spell_hover_uuid_value;
    let mounted;
    let dispose;
    function select_block_type_1(ctx2, dirty) {
      if (
        /*activeTab*/
        ctx2[1] === 0
      ) return create_if_block_2;
      return create_else_block_1;
    }
    let current_block_type = select_block_type_1(ctx, -1);
    let if_block = current_block_type(ctx);
    function click_handler_1() {
      return (
        /*click_handler_1*/
        ctx[13](
          /*spell*/
          ctx[15]
        )
      );
    }
    return {
      c() {
        div1 = element("div");
        div0 = element("div");
        if_block.c();
        t0 = space();
        img = element("img");
        t1 = space();
        span = element("span");
        t2 = text(t2_value);
        t3 = space();
        button = element("button");
        button.innerHTML = `<i class="fas fa-book-open"></i> Info`;
        t5 = space();
        if (!src_url_equal(img.src, img_src_value = /*spell*/
        ctx[15].img)) attr(img, "src", img_src_value);
        attr(img, "alt", "");
        attr(img, "width", "20");
        attr(img, "height", "20");
        set_style(img, "border-radius", "3px");
        set_style(img, "margin-right", "10px");
        set_style(img, "background", "#eee");
        set_style(span, "font-weight", "bold");
        set_style(div0, "display", "flex");
        set_style(div0, "align-items", "center");
        attr(button, "type", "button");
        set_style(button, "background", "none");
        set_style(button, "border", "none");
        set_style(button, "color", "#7a2214");
        set_style(button, "cursor", "pointer");
        set_style(button, "font-size", "11px");
        set_style(button, "font-weight", "bold");
        attr(div1, "data-spell-hover-uuid", div1_data_spell_hover_uuid_value = /*spell*/
        ctx[15].uuid);
        set_style(div1, "display", "flex");
        set_style(div1, "align-items", "center");
        set_style(div1, "padding", "6px 8px");
        set_style(div1, "margin-bottom", "4px");
        set_style(div1, "background", "#fff");
        set_style(div1, "border", "1px solid #e0e0e0");
        set_style(div1, "border-radius", "4px");
        set_style(div1, "font-size", "12px");
        set_style(div1, "justify-content", "space-between");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        if_block.m(div0, null);
        append(div0, t0);
        append(div0, img);
        append(div0, t1);
        append(div0, span);
        append(span, t2);
        append(div1, t3);
        append(div1, button);
        append(div1, t5);
        if (!mounted) {
          dispose = listen(button, "click", click_handler_1);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (current_block_type === (current_block_type = select_block_type_1(ctx, dirty)) && if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block.d(1);
          if_block = current_block_type(ctx);
          if (if_block) {
            if_block.c();
            if_block.m(div0, t0);
          }
        }
        if (dirty & /*visibleSpells*/
        256 && !src_url_equal(img.src, img_src_value = /*spell*/
        ctx[15].img)) {
          attr(img, "src", img_src_value);
        }
        if (dirty & /*visibleSpells*/
        256 && t2_value !== (t2_value = /*spell*/
        ctx[15].name + "")) set_data(t2, t2_value);
        if (dirty & /*visibleSpells*/
        256 && div1_data_spell_hover_uuid_value !== (div1_data_spell_hover_uuid_value = /*spell*/
        ctx[15].uuid)) {
          attr(div1, "data-spell-hover-uuid", div1_data_spell_hover_uuid_value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
        if_block.d();
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment(ctx) {
    let div5;
    let div1;
    let h3;
    let t0;
    let t1_value = (
      /*stats*/
      (ctx[5].classId || "None") + ""
    );
    let t1;
    let t2;
    let t3_value = (
      /*stats*/
      ctx[5].level + ""
    );
    let t3;
    let t4;
    let t5;
    let div0;
    let span0;
    let t6;
    let strong0;
    let t7_value = (
      /*chosenCantrips*/
      ctx[2].length + ""
    );
    let t7;
    let t8;
    let t9_value = (
      /*stats*/
      ctx[5].cantripsMax + ""
    );
    let t9;
    let t10;
    let span1;
    let t11;
    let strong1;
    let t12;
    let t13;
    let t14_value = (
      /*stats*/
      ctx[5].spellsMax + ""
    );
    let t14;
    let t15;
    let span2;
    let t16;
    let strong2;
    let t17;
    let t18_value = (
      /*stats*/
      ctx[5].maxTier + ""
    );
    let t18;
    let t19;
    let div2;
    let t20;
    let div3;
    let t21;
    let div4;
    let button;
    let i;
    let t22;
    let button_disabled_value;
    let mounted;
    let dispose;
    let each_value_1 = ensure_array_like(Array(10));
    let each_blocks = [];
    for (let i2 = 0; i2 < each_value_1.length; i2 += 1) {
      each_blocks[i2] = create_each_block_1(get_each_context_1(ctx, each_value_1, i2));
    }
    function select_block_type(ctx2, dirty) {
      if (
        /*activeTab*/
        ctx2[1] > /*stats*/
        ctx2[5].maxTier
      ) return create_if_block;
      if (
        /*allSpells*/
        ctx2[4].length === 0
      ) return create_if_block_1;
      return create_else_block;
    }
    let current_block_type = select_block_type(ctx, -1);
    let if_block = current_block_type(ctx);
    return {
      c() {
        div5 = element("div");
        div1 = element("div");
        h3 = element("h3");
        t0 = text("Class: ");
        t1 = text(t1_value);
        t2 = text(" (Level ");
        t3 = text(t3_value);
        t4 = text(")");
        t5 = space();
        div0 = element("div");
        span0 = element("span");
        t6 = text("🔮 Cantrips: ");
        strong0 = element("strong");
        t7 = text(t7_value);
        t8 = text(" / ");
        t9 = text(t9_value);
        t10 = space();
        span1 = element("span");
        t11 = text("📖 Prepared Pool: ");
        strong1 = element("strong");
        t12 = text(
          /*totalLeveledChosen*/
          ctx[6]
        );
        t13 = text(" / ");
        t14 = text(t14_value);
        t15 = space();
        span2 = element("span");
        t16 = text("🛡️ Max Tier: ");
        strong2 = element("strong");
        t17 = text("Level ");
        t18 = text(t18_value);
        t19 = space();
        div2 = element("div");
        for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
          each_blocks[i2].c();
        }
        t20 = space();
        div3 = element("div");
        if_block.c();
        t21 = space();
        div4 = element("div");
        button = element("button");
        i = element("i");
        t22 = text(" Memorize Selections");
        set_style(h3, "margin", "0");
        set_style(h3, "font-size", "16px");
        set_style(h3, "font-weight", "bold");
        set_style(div0, "margin-top", "6px");
        set_style(div0, "font-size", "12px");
        set_style(div0, "display", "flex");
        set_style(div0, "gap", "15px");
        set_style(div0, "opacity", "0.95");
        set_style(div1, "background", "#7a2214");
        set_style(div1, "color", "#fff");
        set_style(div1, "padding", "10px 14px");
        set_style(div1, "border-radius", "4px");
        set_style(div1, "margin-bottom", "12px");
        set_style(div1, "border", "1px solid #5a140a");
        set_style(div1, "text-transform", "capitalize");
        set_style(div2, "display", "flex");
        set_style(div2, "gap", "2px");
        set_style(div2, "border-bottom", "2px solid #7a2214");
        set_style(div2, "margin-bottom", "10px");
        set_style(div2, "padding-bottom", "2px");
        set_style(div2, "overflow-x", "auto");
        set_style(div3, "flex-grow", "1");
        set_style(div3, "min-height", "230px");
        set_style(div3, "max-height", "280px");
        set_style(div3, "overflow-y", "auto");
        set_style(div3, "background", "#fafafa");
        set_style(div3, "border", "1px solid #ddd");
        set_style(div3, "padding", "10px");
        set_style(div3, "border-radius", "4px");
        set_style(div3, "margin-bottom", "12px");
        attr(i, "class", "fas fa-magic");
        attr(button, "type", "button");
        button.disabled = button_disabled_value = !/*isBudgetMet*/
        ctx[7];
        set_style(button, "background", "#111");
        set_style(button, "color", "#fff");
        set_style(button, "border", "1px solid #7a2214");
        set_style(button, "padding", "8px 18px");
        set_style(button, "border-radius", "4px");
        set_style(button, "font-weight", "bold");
        set_style(button, "cursor", "pointer");
        set_style(button, "font-size", "12px");
        set_style(
          button,
          "opacity",
          /*isBudgetMet*/
          ctx[7] ? "1" : "0.4"
        );
        set_style(div4, "display", "flex");
        set_style(div4, "justify-content", "flex-end");
        set_style(div4, "padding-top", "4px");
        set_style(div4, "border-top", "1px solid #eee");
        attr(div5, "class", "ryu-spell-picker-container");
        set_style(div5, "font-family", "sans-serif");
        set_style(div5, "display", "flex");
        set_style(div5, "flex-direction", "column");
        set_style(div5, "background", "#fff");
        set_style(div5, "padding", "10px");
        set_style(div5, "border-radius", "4px");
        set_style(div5, "box-sizing", "border-box");
        set_style(div5, "color", "#222");
      },
      m(target, anchor) {
        insert(target, div5, anchor);
        append(div5, div1);
        append(div1, h3);
        append(h3, t0);
        append(h3, t1);
        append(h3, t2);
        append(h3, t3);
        append(h3, t4);
        append(div1, t5);
        append(div1, div0);
        append(div0, span0);
        append(span0, t6);
        append(span0, strong0);
        append(strong0, t7);
        append(strong0, t8);
        append(strong0, t9);
        append(div0, t10);
        append(div0, span1);
        append(span1, t11);
        append(span1, strong1);
        append(strong1, t12);
        append(strong1, t13);
        append(strong1, t14);
        append(div0, t15);
        append(div0, span2);
        append(span2, t16);
        append(span2, strong2);
        append(strong2, t17);
        append(strong2, t18);
        append(div5, t19);
        append(div5, div2);
        for (let i2 = 0; i2 < each_blocks.length; i2 += 1) {
          if (each_blocks[i2]) {
            each_blocks[i2].m(div2, null);
          }
        }
        append(div5, t20);
        append(div5, div3);
        if_block.m(div3, null);
        append(div5, t21);
        append(div5, div4);
        append(div4, button);
        append(button, i);
        append(button, t22);
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*click_handler_2*/
            ctx[14]
          );
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & /*stats*/
        32 && t1_value !== (t1_value = /*stats*/
        (ctx2[5].classId || "None") + "")) set_data(t1, t1_value);
        if (dirty & /*stats*/
        32 && t3_value !== (t3_value = /*stats*/
        ctx2[5].level + "")) set_data(t3, t3_value);
        if (dirty & /*chosenCantrips*/
        4 && t7_value !== (t7_value = /*chosenCantrips*/
        ctx2[2].length + "")) set_data(t7, t7_value);
        if (dirty & /*stats*/
        32 && t9_value !== (t9_value = /*stats*/
        ctx2[5].cantripsMax + "")) set_data(t9, t9_value);
        if (dirty & /*totalLeveledChosen*/
        64) set_data(
          t12,
          /*totalLeveledChosen*/
          ctx2[6]
        );
        if (dirty & /*stats*/
        32 && t14_value !== (t14_value = /*stats*/
        ctx2[5].spellsMax + "")) set_data(t14, t14_value);
        if (dirty & /*stats*/
        32 && t18_value !== (t18_value = /*stats*/
        ctx2[5].maxTier + "")) set_data(t18, t18_value);
        if (dirty & /*activeTab*/
        2) {
          each_value_1 = ensure_array_like(Array(10));
          let i2;
          for (i2 = 0; i2 < each_value_1.length; i2 += 1) {
            const child_ctx = get_each_context_1(ctx2, each_value_1, i2);
            if (each_blocks[i2]) {
              each_blocks[i2].p(child_ctx, dirty);
            } else {
              each_blocks[i2] = create_each_block_1(child_ctx);
              each_blocks[i2].c();
              each_blocks[i2].m(div2, null);
            }
          }
          for (; i2 < each_blocks.length; i2 += 1) {
            each_blocks[i2].d(1);
          }
          each_blocks.length = each_value_1.length;
        }
        if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block.d(1);
          if_block = current_block_type(ctx2);
          if (if_block) {
            if_block.c();
            if_block.m(div3, null);
          }
        }
        if (dirty & /*isBudgetMet*/
        128 && button_disabled_value !== (button_disabled_value = !/*isBudgetMet*/
        ctx2[7])) {
          button.disabled = button_disabled_value;
        }
        if (dirty & /*isBudgetMet*/
        128) {
          set_style(
            button,
            "opacity",
            /*isBudgetMet*/
            ctx2[7] ? "1" : "0.4"
          );
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching) {
          detach(div5);
        }
        destroy_each(each_blocks, detaching);
        if_block.d();
        mounted = false;
        dispose();
      }
    };
  }
  function instance($$self, $$props, $$invalidate) {
    let visibleSpells;
    let totalLeveledChosen;
    let isBudgetMet;
    let { actor } = $$props;
    let activeTab = 0;
    let chosenCantrips = [];
    let chosenLeveledByTier = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };
    let allSpells = [];
    let stats = {
      classId: "",
      level: 1,
      cantripsMax: 0,
      spellsMax: 0,
      maxTier: 1
    };
    onMount(async () => {
      $$invalidate(5, stats = window.ryuCCTools.calculateCasterBudgets(actor));
      $$invalidate(4, allSpells = await window.ryuCCTools.loadSpellConfigLibrary(stats.classId));
      const sheetState = await window.ryuCCTools.getPreExistingWizardSelections(actor, stats.classId);
      $$invalidate(2, chosenCantrips = sheetState.cantrips);
      $$invalidate(3, chosenLeveledByTier = sheetState.leveledByTier);
    });
    const $$binding_groups = [[], []];
    const click_handler = (i) => $$invalidate(1, activeTab = i);
    function input_change_handler() {
      chosenCantrips = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
      $$invalidate(2, chosenCantrips);
    }
    function input_change_handler_1() {
      chosenLeveledByTier[activeTab] = get_binding_group_value($$binding_groups[1], this.__value, this.checked);
      $$invalidate(3, chosenLeveledByTier);
    }
    const click_handler_1 = (spell) => window.ryuCCTools.inspectSpell(spell.uuid);
    const click_handler_2 = () => {
      const flattenedLeveledUuids = Object.values(chosenLeveledByTier).flat();
      window.ryuCCTools.commitSpellsToActor(actor, [...chosenCantrips, ...flattenedLeveledUuids], stats.classId);
    };
    $$self.$$set = ($$props2) => {
      if ("actor" in $$props2) $$invalidate(0, actor = $$props2.actor);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & /*allSpells, activeTab*/
      18) {
        $: $$invalidate(8, visibleSpells = allSpells.filter((s) => s.level === activeTab));
      }
      if ($$self.$$.dirty & /*chosenLeveledByTier*/
      8) {
        $: $$invalidate(6, totalLeveledChosen = Object.values(chosenLeveledByTier).reduce((sum, arr) => sum + arr.length, 0));
      }
      if ($$self.$$.dirty & /*chosenCantrips, stats, totalLeveledChosen*/
      100) {
        $: $$invalidate(7, isBudgetMet = chosenCantrips.length === stats.cantripsMax && totalLeveledChosen === stats.spellsMax);
      }
    };
    return [
      actor,
      activeTab,
      chosenCantrips,
      chosenLeveledByTier,
      allSpells,
      stats,
      totalLeveledChosen,
      isBudgetMet,
      visibleSpells,
      click_handler,
      input_change_handler,
      $$binding_groups,
      input_change_handler_1,
      click_handler_1,
      click_handler_2
    ];
  }
  class SpellPicker extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance, create_fragment, safe_not_equal, { actor: 0 });
    }
  }
  window.ryuCCTools = window.ryuCCTools || {};
  globalThis.ryuCCTools = globalThis.ryuCCTools || window.ryuCCTools;
  globalThis.ryuCCTools.launchMultiTabSpellPicker = async function({ actor }) {
    if (!actor) return ui.notifications.warn("Valid character actor required.");
    const dialog = new foundry.applications.api.DialogV2({
      window: {
        title: `Spell Selection Wizard — ${actor.name}`,
        icon: "fas fa-magic"
      },
      content: `<div id="ryu-spell-picker-root" style="min-width: 520px; min-height: 480px; display: flex; flex-direction: column; background: #fff;"></div>`,
      buttons: [
        {
          action: "close",
          label: "Close Wizard",
          icon: "fas fa-times"
        }
      ]
    });
    Hooks.once(`renderDialogV2`, (app, html) => {
      if (app.id === dialog.id) {
        const container = app.element.querySelector("#ryu-spell-picker-root");
        if (container) {
          new SpellPicker({
            target: container,
            props: { actor }
          });
          app.element.addEventListener("mouseover", async (event) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
            const row = event.target.closest("[data-spell-hover-uuid]");
            if (!row) return;
            const uuid = row.getAttribute("data-spell-hover-uuid");
            if (row.getAttribute("data-cached-uuid") !== uuid) {
              row.removeAttribute("data-tooltip");
              row.setAttribute("data-cached-uuid", uuid);
            } else if (row.hasAttribute("data-tooltip")) {
              return;
            }
            try {
              const spellDoc = await fromUuid(uuid);
              if (spellDoc) {
                const rawDescription = ((_b = (_a = spellDoc.system) == null ? void 0 : _a.description) == null ? void 0 : _b.value) || "No mechanical description provided.";
                const enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(rawDescription, {
                  secrets: false,
                  rollData: actor.getRollData(),
                  async: true
                });
                const castTime = ((_c = spellDoc.labels) == null ? void 0 : _c.activation) || "1 Action";
                const rangeText = ((_d = spellDoc.labels) == null ? void 0 : _d.range) || "Self";
                const targetText = (_e = spellDoc.labels) == null ? void 0 : _e.target;
                const durationText = ((_f = spellDoc.labels) == null ? void 0 : _f.duration) || "Instantaneous";
                const schoolLabel = ((_g = spellDoc.labels) == null ? void 0 : _g.school) || "Evocation";
                const comps = [];
                const props = (_h = spellDoc.system) == null ? void 0 : _h.properties;
                if (props) {
                  if (props.has("vocal") || ((_i = props.includes) == null ? void 0 : _i.call(props, "vocal"))) comps.push("V");
                  if (props.has("somatic") || ((_j = props.includes) == null ? void 0 : _j.call(props, "somatic"))) comps.push("S");
                  if (props.has("material") || ((_k = props.includes) == null ? void 0 : _k.call(props, "material"))) comps.push("M");
                }
                const compText = comps.length > 0 ? comps.join(", ") : "None";
                const targetRowHtml = targetText && targetText !== "None" ? `<div class="spell-metadata-row"><strong>Target:</strong> <span style="color:#fff;">${targetText}</span></div>` : "";
                const popoverHtml = `
                                <div class="ryu-custom-tooltip-wrapper">
                                    <style>
                                        .ryu-custom-tooltip-wrapper {
                                            all: initial;
                                            display: block;
                                            box-sizing: border-box;
                                            width: 340px;
                                            max-width: 340px;
                                            padding: 8px 10px;
                                            color: #f0f0e0;
                                            font-family: var(--font-primary, "Signika", sans-serif);
                                            font-size: 12px;
                                            line-height: 1.4;
                                            background: #191813; /* Foundry's native dark tooltip background */
                                            border: 1px.solid #4b4a40;
                                            border-radius: 4px;
                                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
                                            word-break: break-word;
                                            overflow-wrap: break-word;
                                        }
                                        .ryu-custom-tooltip-wrapper * {
                                            box-sizing: border-box;
                                        }
                                        .ryu-custom-tooltip-wrapper h3 {
                                            margin: 0 0 2px 0;
                                            color: #f0f0e0;
                                            font-size: 15px;
                                            font-weight: bold;
                                            border-bottom: 1px solid #c4b581; /* Foundry gold/brass accent line */
                                            padding-bottom: 4px;
                                        }
                                        .ryu-custom-tooltip-wrapper .spell-metadata-row {
                                            display: flex;
                                            justify-content: space-between;
                                            margin-bottom: 2px;
                                        }
                                        .ryu-custom-tooltip-wrapper .spell-description-body {
                                            margin-top: 6px;
                                            padding-top: 6px;
                                            border-top: 1px solid #444;
                                        }
                                        .ryu-custom-tooltip-wrapper p {
                                            margin: 0 0 6px 0;
                                            white-space: normal;
                                        }
                                    </style>

                                    <h3>${spellDoc.name}</h3>
                                    <div style="font-size: 11px; margin-bottom: 8px; color: #aaa; font-style: italic;">
                                        ${spellDoc.system.level === 0 ? "Cantrip" : "Level " + spellDoc.system.level} • ${schoolLabel}
                                    </div>
                                    
                                    <!-- Metric Data Grid -->
                                    <div style="font-size: 11px; margin-bottom: 6px; color: #ddd;">
                                        <div class="spell-metadata-row"><strong>Casting Time:</strong> <span style="color:#fff;">${castTime}</span></div>
                                        <div class="spell-metadata-row"><strong>Range:</strong> <span style="color:#fff;">${rangeText}</span></div>
                                        ${targetRowHtml}
                                        <div class="spell-metadata-row"><strong>Components:</strong> <span style="color:#fff;">${compText}</span></div>
                                        <div class="spell-metadata-row"><strong>Duration:</strong> <span style="color:#fff;">${durationText}</span></div>
                                    </div>

                                    <!-- Enriched Description Block -->
                                    <div class="spell-description-body">
                                        ${enrichedDescription}
                                    </div>
                                </div>
                            `;
                row.setAttribute("data-tooltip", popoverHtml);
                game.tooltip.activate(row, {
                  direction: "RIGHT",
                  interactive: true,
                  cssClass: "tooltip-custom-spell-card"
                });
              }
            } catch (e) {
              console.warn("[Ryu Roller Debug] Tooltip calculation warning bypassed safely:", e);
            }
          });
        }
      }
    });
    await dialog.render(true);
  };
  function shouldTriggerWizardForActor(actor) {
    if (!actor) return false;
    if (!actor.isOwner) return;
    if (!game.user.isGM && !actor.testUserPermission(game.user, "OWNER")) return false;
    return true;
  }
  async function checkAndLaunchWizard(item) {
    var _a, _b;
    if (item.type !== "class" || !item.actor) return;
    const actor = item.actor;
    if (!shouldTriggerWizardForActor(actor)) return;
    const classId = item.name.toLowerCase();
    try {
      const library = await ((_b = (_a = globalThis.ryuCCTools) == null ? void 0 : _a.loadSpellConfigLibrary) == null ? void 0 : _b.call(_a, classId));
      if (!library || library.length === 0) return;
    } catch (e) {
      return;
    }
    setTimeout(async () => {
      ui.notifications.info(`Spell configuration ready for ${item.name}. Opening Wizard...`);
      await globalThis.ryuCCTools.launchMultiTabSpellPicker({ actor });
    }, 500);
  }
  Hooks.on("createItem", async (item, options, userId) => {
    if (userId !== game.userId) return;
    await checkAndLaunchWizard(item);
  });
  Hooks.on("updateItem", async (item, changes, options, userId) => {
    var _a;
    if (userId !== game.userId) return;
    if (item.type !== "class") return;
    if (((_a = changes.system) == null ? void 0 : _a.levels) !== void 0) {
      await checkAndLaunchWizard(item);
    }
  });
  console.log("[Ryu Roller] Modern Svelte Spell Selection framework successfully bound via ApplicationV2 Hooks!");
})();
//# sourceMappingURL=main.js.map
