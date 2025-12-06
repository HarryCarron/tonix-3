import type { MenuGrouping, MenuOptions } from "./Menu";

export const menuItems: MenuOptions = [
    {
        title: 'Instruments',
        items: [
            {
                title: 'Piano',
            }
        ]
    } as MenuGrouping,
    {
        title: 'Effects',
        items: [
            {
                title: 'Delay',
            },
            {
                title: 'Reverb',
            },
            {
                title: 'Phaser',
            }
        ]
    } as MenuGrouping,
]