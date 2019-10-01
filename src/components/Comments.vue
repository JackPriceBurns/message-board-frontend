<template>
    <div>
        <CommentForm @commentCreated="handleCommentCreated" :message="message"></CommentForm>

        <comment @commentDeleted="handleCommentDeleted"
                 v-if="comments.length !== 0"
                 v-for="comment in comments"
                 :key="comment.id"
                 :comment="comment"
                 class="my-4">
        </comment>

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
    import Comment from './Comment';
    import CommentForm from './CommentForm';

    export default {
        name: 'Comments',

        components: {
            Comment,
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
             * Add the new comment to the screen.
             */
            async handleCommentCreated(event) {
                if (!this.initialised) {
                    await this.init();

                    return;
                }

                let comment = _.find(this.comments, {id: event.id});

                if (comment) {
                    return;
                }

                this.comments.unshift(event);
            },

            /**
             * Delete the comment from the screen.
             */
            async handleCommentDeleted(event) {
                if (!this.initialised) {
                    return;
                }

                let comment = _.find(this.comments, {id: event.id});

                if (!comment) {
                    return;
                }

                this.comments.splice(this.comments.indexOf(comment), 1);
            },
        },
    };
</script>
