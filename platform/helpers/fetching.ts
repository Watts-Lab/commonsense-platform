import axios from "axios";

interface GetRequest {
    url: string;
}

interface PostRequest {
    url: string;
    data: any;
}

export const getFetcher = (props: GetRequest) => fetch(props.url).then(res => res.json());
export const postFetcher = (props: PostRequest) => axios.post(props.url, props.data).then(res => res.data)