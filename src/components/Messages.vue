<template>
    <div class="container mx-auto p-4 md:w-3/4">
        <MessageHeader @loggedOut="$emit('loggedOut')"></MessageHeader>
        <MessageForm @messageCreated="handleMessageCreated"></MessageForm>

        <div class="rounded shadow-md mb-8"
             v-for="message in messages"
             :key="message.id"
             :id="'message-' + message.id">
            <div class="px-6 py-4">
                <Message :message="message" @messageDeleted="handleMessageDeleted"></Message>

                <hr class="my-5">

                <Comments :message="message" :ref="'comments-' + message.id"></Comments>
            </div>
        </div>

        <div v-if="!loadMore" class="text-center py-4">
            There are no more messages.
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import io from 'socket.io-client';
    import Message from './Message';
    import Comments from './Comments';
    import MessageForm from './MessageForm';
    import MessageHeader from './MessageHeader';

    export default {
        name: 'Messages',

        components: {
            Message,
            Comments,
            MessageForm,
            MessageHeader,
        },

        props: {
            token: {
                type: String,
                required: true,
            },
        },

        data() {
            return {
                page: 1,
                messages: [],
                loadMore: true,
            };
        },

        /**
         * Setup listeners & load resources.
         */
        async mounted() {
            window.addEventListener("scroll", _.throttle(this.handleScroll, 50));

            await this.loadMessages();
            await this.checkVisibleMessages();
            await this.setupWebsockets();
        },

        /**
         * Tear down any listeners.
         */
        beforeDestroy() {
            window.removeEventListener("scroll", _.throttle(this.handleScroll, 50));
        },

        methods: {
            /**
             * Load all the messages from the API.
             */
            async loadMessages() {
                try {
                    let params = {page: this.page};
                    let response = await this.axios.get('/api/messages', {params});

                    if (response.data.data.length === 0) {
                        this.loadMore = false;
                    }

                    this.messages = _.unionBy(this.messages, response.data.data, 'id');
                } catch (error) {
                    alert('Error loading messages.');
                }
            },

            /**
             * Handle the user scrolling.
             */
            async handleScroll() {
                this.checkVisibleMessages();
                this.loadMoreMessages();
            },

            /**
             * Check to see if any messages are visible on the screen.
             */
            async checkVisibleMessages() {
                this.messages.forEach(this.checkVisible);
            },

            /**
             * Load the next load of messages from the API.
             */
            async loadMoreMessages() {
                if (!this.loadMore) {
                    return;
                }

                let elem = document.querySelector('html');

                if (elem.scrollTop + (elem.clientHeight + 20) < elem.scrollHeight) {
                    return;
                }

                this.page++;

                await this.loadMessages();
            },

            /**
             * Check if the specified message is visible on the page. If it is visible,
             * load the comments (if they're not already)
             */
            async checkVisible(message) {
                let elem = document.querySelector('#message-' + message.id);
                let rect = elem.getBoundingClientRect();

                if (!(rect.top < window.innerHeight) || !(rect.bottom >= 0)) {
                    return false;
                }

                if (message.comments !== undefined) {
                    return;
                }

                await this.$refs['comments-' + message.id][0].init();
            },

            /**
             * Start listening to web sockets.
             *
             * @returns {Promise<void>}
             */
            async setupWebsockets() {
                let socket = await io.connect(process.env.VUE_APP_API, {
                    query: {token: 'Bearer ' + this.token}
                });

                socket.on('messageCreated', this.handleMessageCreated);
                socket.on('messageDeleted', this.handleMessageDeleted);
                socket.on('commentCreated', this.handleCommentCreated);
                socket.on('commentDeleted', this.handleCommentDeleted);
            },

            /**
             * Add the new message to the screen.
             */
            handleMessageCreated(event) {
                let message = _.find(this.messages, {id: event.id});

                // If the message is there, don't do anything.
                if (message) {
                    return;
                }

                // Add the message.
                this.messages.unshift(event);

                // Ensure that the element has been added first.
                this.$nextTick(() => {
                    this.checkVisibleMessages();
                });
            },

            /**
             * Remove the message from the screen.
             */
            handleMessageDeleted(event) {
                let message = _.find(this.messages, {id: event.id});

                // If the message isn't there, don't do anything.
                if (!message) {
                    return;
                }

                // Remove the message.
                this.messages.splice(this.messages.indexOf(message), 1);

                // Ensure that the element has been added first.
                this.$nextTick(() => {
                    this.checkVisibleMessages();
                });
            },

            /**
             * Add the new comment to the screen.
             */
            handleCommentCreated(event) {
                let message = _.find(this.messages, {id: event.message_id});

                if (!message) {
                    return;
                }

                this.$refs['comments-' + message.id][0].handleCommentCreated(event);
            },

            /**
             * Add the new comment to the screen.
             */
            handleCommentDeleted(event) {
                let message = _.find(this.messages, {id: event.message_id});

                if (!message) {
                    return;
                }

                this.$refs['comments-' + message.id][0].handleCommentDeleted(event);
            },
        },
    };
</script>
