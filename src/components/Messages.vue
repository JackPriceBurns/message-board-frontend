<template>
    <div class="container mx-auto py-4">
        <h1 class="text-xl mb-4">Messages</h1>

        <div class="rounded overflow-hidden shadow-md mb-8 w-3/4"
             v-for="message in messages"
             :key="message.id"
             :id="'message-' + message.id">
            <div class="px-6 py-4">
                <div><span class="font-bold">Jack Price-Burns</span></div>
                <div><span class="text-gray-600">{{ message.created_at | dateFormat }}</span></div>

                <div class="py-3">
                    {{ message.message }}
                </div>

                <hr class="my-5">

                <div class="flex mt-2">
                    <div class="w-5/6 pr-2">
                        <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 focus:outline-none focus:bg-white"
                               type="text"
                               placeholder="Comment...">
                    </div>

                    <div class="w-1/6 pl-2">
                        <button class="bg-blue-500 hover:bg-blue-700 w-full text-white font-bold py-2 rounded">
                            Send
                        </button>
                    </div>
                </div>

                <span class="font-bold" v-if="message.loading">Loading...</span>

                <div v-if="message.comments && message.comments.length !== 0">
                    <div v-for="comment in message.comments" :key="comment.id" class="my-4">
                        <div><span class="font-bold">{{ comment.user.name }}</span></div>
                        <div class="py-2">{{ comment.message }}</div>
                        <div><span class="text-gray-600">{{ comment.created_at | dateFormat }}</span></div>
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

    export default {
        name: 'Messages',

        data() {
            return {
                token: this.getToken(),
                messages: [],
            };
        },

        filters: {
            dateFormat(value) {
                return moment(value).fromNow();
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

            async loadMessages() {
                let response = await axios.get('http://localhost:8000/api/messages');

                this.messages = response.data.data;
            },

            async checkVisibleMessages() {
                this.messages.forEach(message => {
                    let elem = document.querySelector('#message-' + message.id);

                    let rect = elem.getBoundingClientRect();
                    let elemTop = rect.top;
                    let elemBottom = rect.bottom;

                    if (!(elemTop >= 0) || !(elemBottom <= window.innerHeight)) {
                        return false;
                    }

                    if (message.comments !== undefined) {
                        return;
                    }

                    this.loadComments(message);
                });
            },

            loadComments(message) {
                if (message.loading) {
                    return;
                }

                Vue.set(message, 'loading', true);

                axios.get('http://localhost:8000/api/messages/' + message.id + '/comments')
                    .then(response => {
                        Vue.set(message, 'comments', response.data.data);
                        Vue.set(message, 'loading', false);
                    })
                    .catch(() => alert('An unknown error occurred.'));
            }
        },
    };
</script>
