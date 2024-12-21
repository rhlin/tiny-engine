<template>
  <div class="draggable-tree">
    <div :class="['row', { active: active === node.id }]" v-for="node of list" :key="node.id">
      <div class="content" @click="handleClickRow(node)">
        <span v-for="i in node.level - 1" :key="i" class="gap"></span>
        <div class="prefix-icon">
          <svg-icon v-if="node.rawData.isPage" name="text-page-common"></svg-icon>
          <svg-icon v-else name="text-page-folder-closed"></svg-icon>
        </div>
        <label>{{ node.label }}</label>
      </div>
      <slot name="row-suffix" :node="node"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'

// TODO filter 功能
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  idKey: {
    type: String,
    default: 'id'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  childrenKey: {
    type: String,
    default: 'children'
  },
  active: {
    type: String
  }
})

const emit = defineEmits(['clickRow'])

const ROOT_ID = '0'

const flattenTreeData = (node, parentId, level = 0) => {
  const { idKey, labelKey, childrenKey } = props

  const currentNode = {
    id: node[idKey],
    label: node[labelKey],
    parentId,
    level,
    rawData: node
  }
  const result = [currentNode]

  const children = node[childrenKey]

  if (Array.isArray(children)) {
    for (const child of children) {
      result.push(...flattenTreeData(child, currentNode.id, level + 1))
    }
  }

  return result
}

const list = computed(() => {
  return flattenTreeData({ id: ROOT_ID, children: props.data }).slice(1)
})

const handleClickRow = (node) => {
  emit('clickRow', node)
}
</script>

<style lang="less" scoped>
.draggable-tree {
  .row {
    height: 24px;
    padding: 0 12px;
    margin: 0;
    display: flex;
    align-items: center;
    &,
    * {
      cursor: pointer;
    }
    &:hover {
      background-color: var(--te-common-bg-container);
    }
    .content {
      flex: 1;
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .gap {
      width: 16px;
    }
    label {
      flex: 1;
      font-size: 12px;
      line-height: 18px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .prefix-icon {
      display: flex;
      align-items: center;
      margin-right: 8px;
      svg {
        color: var(--te-common-icon-secondary);
      }
    }
    &.active {
      background-color: var(--te-base-blue-20);
      color: var(--te-common-bg-primary-checked);
      svg {
        color: var(--te-common-bg-primary-checked);
      }
    }
  }
}
</style>
