import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
} from '@floating-ui/react'
import * as React from 'react'
import MenuList, { MenuListProps } from '../MenuList'
import clsx from 'clsx'

const MenuContext = React.createContext<{
  getItemProps: (
    userProps?: React.HTMLProps<HTMLElement>
  ) => Record<string, unknown>
  activeIndex: number | null
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>
  setHasFocusInside: React.Dispatch<React.SetStateAction<boolean>>
  isOpen: boolean
}>({
  getItemProps: () => ({}),
  activeIndex: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setActiveIndex: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setHasFocusInside: () => {},
  isOpen: false,
})

type ChildrenProps = {
  ref: React.Ref<HTMLButtonElement> | undefined
  referenceProps: Record<string, unknown>
  otherProps: any
}

interface MenuProps {
  children: (props: ChildrenProps) => JSX.Element
  nested?: boolean
  menus: MenuListProps['menus']
  panelClassName?: string
  panelSize?: MenuListProps['size']
  isOpen: boolean
  focus?: number
  itemClassName?: string
  setIsOpen: (isOpen: boolean) => void
}

export const MenuComponent = React.forwardRef<
  HTMLButtonElement,
  MenuProps & React.HTMLProps<HTMLButtonElement>
>(
  (
    {
      menus,
      panelClassName,
      panelSize,
      focus,
      isOpen,
      itemClassName,
      setIsOpen,
      children,
      ...props
    },
    forwardedRef
  ) => {
    const [hasFocusInside, setHasFocusInside] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

    const elementsRef = React.useRef<Array<HTMLButtonElement | null>>([])
    const labelsRef = React.useRef<Array<string | null>>([])
    const parent = React.useContext(MenuContext)

    const tree = useFloatingTree()
    const nodeId = useFloatingNodeId()
    const parentId = useFloatingParentNodeId()
    const item = useListItem()

    const { floatingStyles, refs, context } = useFloating<HTMLButtonElement>({
      nodeId,
      open: isOpen,
      onOpenChange: setIsOpen,
      placement: 'bottom-start',
      middleware: [offset({ mainAxis: 4, alignmentAxis: 0 }), flip(), shift()],
      whileElementsMounted: autoUpdate,
    })

    const hover = useHover(context, {
      enabled: false,
      delay: { open: 75 },
      handleClose: safePolygon({ blockPointerEvents: true }),
    })
    const click = useClick(context, {
      event: 'mousedown',
      toggle: true,
      ignoreMouse: false,
    })
    const role = useRole(context, { role: 'menu' })
    const dismiss = useDismiss(context, { bubbles: true })
    const listNavigation = useListNavigation(context, {
      listRef: elementsRef,
      activeIndex,
      nested: false,
      onNavigate: setActiveIndex,
    })
    const typeahead = useTypeahead(context, {
      listRef: labelsRef,
      onMatch: isOpen ? setActiveIndex : undefined,
      activeIndex,
    })

    const { getReferenceProps, getFloatingProps, getItemProps } =
      useInteractions([hover, click, role, dismiss, listNavigation, typeahead])

    React.useEffect(() => {
      if (!tree) return

      function handleTreeClick() {
        setIsOpen(false)
      }

      function onSubMenuOpen(event: { nodeId: string; parentId: string }) {
        if (event.nodeId !== nodeId && event.parentId === parentId) {
          setIsOpen(false)
        }
      }

      tree.events.on('click', handleTreeClick)
      tree.events.on('menuopen', onSubMenuOpen)

      return () => {
        tree.events.off('click', handleTreeClick)
        tree.events.off('menuopen', onSubMenuOpen)
      }
    }, [tree, nodeId, parentId])

    React.useEffect(() => {
      if (isOpen && tree) {
        tree.events.emit('menuopen', { parentId, nodeId })
      }
    }, [tree, isOpen, nodeId, parentId])

    const menuList = (
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
        className='z-[10]'
      >
        <MenuList
          size={panelSize}
          className={clsx(
            'overflow-hidden rounded-lg bg-background-light z-[41]',
            'shadow-[0_5px_50px_-12px_rgb(0,0,0,.25)] dark:shadow-[0_5px_50px_-12px_rgb(0,0,0)]',
            panelSize === 'xs' ? 'w-44' : 'w-52',
            panelClassName
          )}
          menus={menus}
          itemClassName={itemClassName}
        />
      </div>
    )

    return (
      <FloatingNode id={nodeId}>
        {children({
          ref: useMergeRefs([refs.setReference, item.ref, forwardedRef]),
          referenceProps: getReferenceProps(
            parent.getItemProps({
              ...props,
              onFocus (event: React.FocusEvent<HTMLButtonElement>) {
                props.onFocus?.(event)
                setHasFocusInside(false)
                parent.setHasFocusInside(true)
              },
            })
          ),
          otherProps: {
            'data-open': isOpen ? '' : undefined,
            'data-focus-inside': hasFocusInside ? '' : undefined,
          },
        })}
        <MenuContext.Provider
          value={{
            activeIndex,
            setActiveIndex,
            getItemProps,
            setHasFocusInside,
            isOpen,
          }}
        >
          <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
            {isOpen && (
              <>
                {focus !== undefined ? (
                  <FloatingFocusManager
                    context={context}
                    modal={false}
                    initialFocus={focus}
                  >
                    {menuList}
                  </FloatingFocusManager>
                ) : (
                  menuList
                )}
              </>
            )}
          </FloatingList>
        </MenuContext.Provider>
      </FloatingNode>
    )
  }
)

export const Menu = React.forwardRef<
  HTMLButtonElement,
  MenuProps & React.HTMLProps<HTMLButtonElement>
>((props, ref) => {
  const parentId = useFloatingParentNodeId()

  if (parentId === null) {
    return (
      <FloatingTree>
        <MenuComponent {...props} ref={ref} />
      </FloatingTree>
    )
  }

  return <MenuComponent {...props} ref={ref} />
})
