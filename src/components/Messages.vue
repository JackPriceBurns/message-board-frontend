<template>
    <div class="container mx-auto py-4">
        <h1 class="text-xl mb-4">Messages</h1>

        <div class="rounded overflow-hidden shadow-md mb-8 w-3/4"
             v-for="message in messages"
             :key="message.id"
             :id="'message-' + message.id">
            <div class="px-6 py-4">
                <div class="flex">
                    <div>
                        <img :src="message.user.email | gravatarPicture(60)" class="rounded-full mr-4"
                             alt="profile picture">
                    </div>

                    <div>
                        <div><span class="font-bold">Jack Price-Burns</span></div>
                        <div><span class="text-gray-600">{{ message.created_at | dateFormat }}</span></div>

                        <div class="py-3">
                            {{ message.message }}
                        </div>
                    </div>
                </div>


                <hr class="my-5">

                <div class="flex mt-2" v-if="commenting && commenting.id === message.id">
                    <div class="w-5/6 pr-2">
                        <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 focus:outline-none focus:bg-white"
                               type="text"
                               v-model="comment"
                               placeholder="Comment...">
                    </div>

                    <div class="w-1/6 pl-2">
                        <button class="bg-blue-500 hover:bg-blue-700 w-full text-white font-bold py-2 rounded"
                                @click="sendComment(message)">
                            Send
                        </button>
                    </div>
                </div>

                <div v-else>
                    <a href="#" @click="toggleCommenting(message)">Add Comment</a>
                </div>

                <span class="font-bold" v-if="message.loading">Loading...</span>

                <div v-if="message.comments && message.comments.length !== 0">
                    <div v-for="comment in message.comments" :key="comment.id" class="my-4">
                        <div class="flex">
                            <div>
                                <img :src="comment.user.email | gravatarPicture(40)"
                                     class="rounded-full mr-2"
                                     alt="profile picture">
                            </div>

                            <div>
                                <div><span class="font-bold">{{ comment.user.name }}</span></div>
                                <div class="py-2">{{ comment.message }}</div>
                                <div><span class="text-gray-600">{{ comment.created_at | dateFormat }}</span></div>
                            </div>
                        </div>

                        <hr>
                    </div>
                </div>

                <div v-else>
                    <span class="text-bold">There are no comments.</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from "vue";
    import axios from 'axios';
    import moment from 'moment';
    import md5 from 'crypto-js/md5';

    export default {
        name: 'Messages',

        data() {
            return {
                token: this.getToken(),
                messages: [],
                comment: '',
                commenting: null,
            };
        },

        filters: {
            dateFormat(value) {
                return moment(value).fromNow();
            },

            gravatarPicture(value, size) {
                return 'https://www.gravatar.com/avatar/' + md5(value) + '?s=' + size;
            },
        },

        async mounted() {
            window.addEventListener("scroll", this.checkVisibleMessages);

            await this.loadMessages();
            await this.checkVisibleMessages();
        },

        beforeDestroy() {
            window.removeEventListener("scroll", this.checkVisibleMessages);
        },

        methods: {
            getToken() {
                let token = this.$cookies.get('token');

                axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

                return token;
            },

            /**
             * Load all the messages from the API.
             */
            async loadMessages() {
                let response = await axios.get('http://localhost:8000/api/messages');

                this.messages = response.data.data;
            },

            /**
             * Check to see if any messages are visible on the screen.
             */
            async checkVisibleMessages() {
                this.messages.forEach(this.checkVisible);
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

                await this.loadComments(message);
            },

            /**
             * Load the comments for the specified message.
             */
            async loadComments(message) {
                if (message.loading) {
                    return;
                }

                Vue.set(message, 'loading', true);

                try {
                    let response = await axios.get('http://localhost:8000/api/messages/' + message.id + '/comments');

                    Vue.set(message, 'comments', response.data.data);
                    Vue.set(message, 'loading', false);
                } catch (error) {
                    alert('An unknown error occurred.');
                }
            },

            /**
             * Create a new comment on the backend.
             */
            sendComment(message) {
                if (!this.comment) {
                    alert('Please type a comment.');

                    return;
                }

                let data = {
                    message: this.comment,
                    message_id: message.id,
                };

                axios.post('http://localhost:8000/api/comments', data)
                    .then(response => {
                        this.comment = '';

                        if (!message.comments) {
                            Vue.set(message, 'comments', [response.data.data]);

                            return;
                        }

                        message.comments.unshift(response.data.data);
                    })
                    .catch(() => alert('An unknown error occurred.'));
            },

            /**
             * Set the specified message as commenting.
             *
             * @param message
             */
            toggleCommenting(message) {
                this.commenting = message;
                this.comment = '';
            }
        },
    };
</script>
