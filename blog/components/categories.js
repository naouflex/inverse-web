import { HStack, Link } from '@chakra-ui/react'
import { useContext } from 'react'
import { BlogContext } from '../../pages/blog/[...slug]'
import { BLOG_THEME } from '../lib/constants';

export default function Categories({ categories, isByAuthor = false, customPage = '' }) {
    const { locale, category } = useContext(BlogContext);
    return <HStack pb="5" spacing="10">
        {
            categories.map(c => {
                const isActive = (category === c.name && !isByAuthor) || (c.isCustomPage && c.name === customPage);
                const url = !c.isCustomPage ? `/blog/${locale}/${c.name}` : `/blog/${c.name}/${locale}`;
                return <Link
                    key={c.order}
                    href={url}
                    color={isActive ? BLOG_THEME.colors.activeTextColor : BLOG_THEME.colors.passiveTextColor}
                    fontSize="20px"
                    fontWeight={isActive ? 'extrabold' : 'bold'}
                    className="">
                    {c.label}
                </Link>
            })
        }
    </HStack>
}