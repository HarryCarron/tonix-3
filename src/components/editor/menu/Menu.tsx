import './Menu.css'

export interface MenuItem {
    title: string,
    icon?: string,
}

export interface MenuGrouping {
    title: string,
    items: MenuItem[]
}

export type MenuOptions = (MenuItem | MenuGrouping)[]

interface MenuProps {
    navItems: MenuOptions;
}

export default function Menu({ navItems }: MenuProps) {
    return (
        <div className='menu-container h-full w-full flex flex-col'>
            <div className='header h-20 text-2xl p-4 flex items-center font-bold'>
                Tonix
            </div>

            <div className='p-4'>
                {
                    navItems.map((item) => {
                        
                        if ((item as MenuGrouping)?.items) {
                            return GroupedMenuItem(item as MenuGrouping)
                        } else {
                            return MenuItem(item as MenuItem)
                        }
                    })
                }
            </div>
            
        </div>
    )
}


function GroupedMenuItem({title, items}: MenuGrouping) {
    return (
        <div key={title} className='py-2'>
            <div className='text-xs font-bold tracking-wide'>
                { title }
            </div>
            <div>

                {
                    items.map((item) => MenuItem(item))
                }

            </div>
        </div>
    );
}

function MenuItem(item: MenuItem) {
    return <div className='px-2 py-1 cursor-pointer my-1 font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg' key={item.title}>{ item.title }</div>
}