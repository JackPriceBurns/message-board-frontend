<template>
    <div class="container mx-auto p-4 md:w-3/4">
        <div class="flex">
            <div class="w-1/2">
                <h1 class="text-xl mb-4">Messages</h1>
            </div>

            <div class="w-1/2 text-right">
                <span class="text-md font-bold mb-4 cursor-pointer" @click="logout()">Logout</span>
            </div>
        </div>

        <MessageForm @messageCreated="handleNewMessage"></MessageForm>

        <div class="rounded shadow-md mb-8"
             v-for="message in messages"
             :key="message.id"
             :id="'message-' + message.id">
            <div class="px-6 py-4">
                <div class="flex">
                    <div>
                        <img :src="message.user.email | gravatarPicture(60)" class="rounded-full mr-4"
                             alt="profile picture">
                    </div>

                    <div class="w-full">
                        <div class="flex">
                            <div class="w-1/2">
                                <div><span class="font-bold">{{ message.user.name }}</span></div>
                                <div><span class="text-gray-600">{{ message.created_at | dateFormat }}</span></div>
                            </div>

                            <div class="w-1/2 text-right">
                                <span class="cursor-pointer" @click="deleteMessage(message)">Delete</span>
                            </div>
                        </div>

                        <div class="py-3">
                            {{ message.message }}
                        </div>
                    </div>
                </div>

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
    import moment from 'moment';
    import md5 from 'crypto-js/md5';
    import Comments from './Comments';
    import MessageForm from './MessageForm';

    export default {
        name: 'Messages',

        components: {
            Comments,
            MessageForm,
        },

        data() {
            return {
                page: 1,
                messages: [],
                loadMore: true,
            };
        },

        filters: {
            /**
             * Convert an iso 8601 date into 'ago' format.
             */
            dateFormat(value) {
                return moment(value).fromNow();
            },

            /**
             * Convert an email into a gravatar url.
             */
            gravatarPicture(value, size) {
                return 'https://www.gravatar.com/avatar/' + md5(value) + '?s=' + size;
            },
        },

        /**
         * Setup listeners & load resources.
         */
        async mounted() {
            window.addEventListener("scroll", _.throttle(this.handleScroll, 50));

            await this.setHeaders();
            await this.loadMessages();
            await this.checkVisibleMessages();
        },

        /**
         * Tear down any listeners.
         */
        beforeDestroy() {
            window.removeEventListener("scroll", _.throttle(this.handleScroll, 50));
        },

        methods: {
            /**
             * Get the access token from the cookies.
             */
            async setHeaders() {
                let token = this.$cookies.get('token');

                this.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            },

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
             * Add the new message to the screen.
             */
            async handleNewMessage(event) {
                this.messages.unshift(event);

                // Ensure that the element has been added first.
                this.$nextTick(() => {
                    this.checkVisibleMessages();
                });
            },

            /**
             * Delete the specified message.
             */
            async deleteMessage(message) {
                try {
                    await this.axios.delete('/api/messages/' + message.id);

                    this.messages.splice(this.messages.indexOf(message), 1);

                    this.checkVisibleMessages();
                } catch (error) {
                    alert('An unknown error occurred deleting the message.')
                }
            },

            /**
             * Log out the current user.
             *
             * @returns {Promise<void>}
             */
            async logout() {
                this.$cookies.remove('token');
                this.$emit('loggedOut');
            }
        },
    };
</script>
