<template>
    <div>
        <CommentForm @newComment="sendComment"></CommentForm>

        <div v-if="comments.length !== 0" v-for="comment in comments" :key="comment.id" class="my-4">
            <hr>

            <div class="flex mt-4">
                <div>
                    <img :src="comment.user.email | gravatarPicture(40)"
                         class="rounded-full mr-2"
                         alt="profile picture">
                </div>

                <div>
                    <div>
                        <span class="font-bold">{{ comment.user.name }}</span>

                        <span class="text-gray-600 ml-1 text-sm">
                            {{ comment.created_at | dateFormat }}
                        </span>
                    </div>

                    <div class="py-2">{{ comment.message }}</div>
                </div>
            </div>
        </div>

        <div class="text-center py-4" v-if="!loadMore && comments.length === 0">
            <span class="text-bold">There are no comments.</span>
        </div>

        <div class="text-center py-4" v-if="!loadMore && comments.length > 0">
            <span class="text-bold">There are no more comments.</span>
        </div>

        <span class="font-bold" v-if="loading">Loading...</span>

        <span class="font-bold cursor-pointer"
              v-if="!loading && loadMore"
              @click="loadMoreComments()">
            Load More
        </span>
    </div>
</template>

<script>
    import _ from 'lodash';
    import CommentForm from './CommentForm';

    export default {
        name: 'Comments',

        components: {
            CommentForm,
        },

        props: {
            message: {
                type: Object,
                required: true,
            },
        },

        data() {
            return {
                page: 1,
                comment: '',
                comments: [],
                loading: false,
                loadMore: true,
                initialised: false,
            };
        },

        methods: {
            /**
             * Load this comments section.
             */
            async init() {
                if (this.initialised) {
                    return;
                }

                this.initialised = true;

                await this.loadComments();
            },

            /**
             * Load the comments for the specified message.
             */
            async loadComments() {
                if (this.loading) {
                    return;
                }

                this.loading = true;

                try {
                    let params = {page: this.page};
                    let response = await this.axios.get('/api/messages/' + this.message.id + '/comments', {params});

                    if (response.data.data.length === 0) {
                        this.loadMore = false;
                    }

                    this.comments = _.unionBy(this.comments, response.data.data, 'id');
                    this.loading = false;
                } catch (error) {
                    alert('An unknown error occurred loading comments.');
                }
            },

            /**
             * Load the next load of comments.
             */
            async loadMoreComments() {
                this.page++;

                await this.loadComments();
            },

            /**
             * Create a new comment on the backend.
             */
            async sendComment(message) {
                let data = {
                    message,
                    message_id: this.message.id,
                };

                try {
                    let response = await this.axios.post('/api/comments', data);

                    this.comments.unshift(response.data.data);
                } catch (error) {
                    alert('An unknown error occurred creating comment.');
                }
            },
        },
    };
</script>
