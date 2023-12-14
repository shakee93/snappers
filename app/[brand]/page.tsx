import {getClient} from "@/lib/apollo-ssr";
import {notFound} from 'next/navigation'
import {GET_POST, GET_POST_SLUGS} from "@/lib/graphql/posts";

export async function generateStaticParams() {

    const {data: {posts}} = await getClient().query({
        query: GET_POST_SLUGS
    });

    return posts.nodes.map(p => p.slug);
}

async function getData(slug) {
    const {data} = await getClient().query(
        {
            query: GET_POST,
            variables: {
                postId: slug
            }
        }
    );


    if (!data.post) {
        return undefined
    }

    return data.post
}

const Brand = async ({params}: { params: { brand: string} }) => {
    const post = await getData(params.brand)

    if (!post) {
        notFound()
    }

    return <div>
        {post.content}
    </div>
}

export default Brand