<template>
    <div class="w-1/2 mx-auto py-16">
        <div class="rounded overflow-hidden shadow-lg">
            <div class="px-6 py-4">
                <div class="font-bold text-xl mb-2">Login</div>

                <div class="mt-4">
                    <label>
                        Email
                        <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 focus:outline-none focus:bg-white"
                               type="text"
                               v-model="email"
                               placeholder="Email">
                    </label>
                </div>

                <div class="mt-4">
                    <label>
                        Password
                        <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 focus:outline-none focus:bg-white"
                               type="password"
                               v-model="password"
                               placeholder="Password">
                    </label>
                </div>
            </div>

            <div class="px-6 py-4 text-right">
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="login()">
                    Login
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'Login',

        data() {
            return {
                email: 'jackpriceburns@outlook.com',
                password: 'password',
            };
        },

        methods: {
            /**
             * Initiate Login
             */
            login() {
                if (!this.email || !this.password) {
                    alert('Please enter an email and password.');

                    return;
                }

                let data = {email: this.email, password: this.password};

                axios.post('http://localhost:8000/auth', data)
                    .then(this.handleLogin)
                    .catch(this.handleError);
            },

            /**
             * Handle the Login Response
             */
            handleLogin(response) {
                if (!response.data && !response.data.data && !response.data.data.token) {
                    alert('Unexpected response from API');

                    return;
                }

                this.$cookies.set('token', response.data.data.token);
                this.$emit('loggedIn');
            },

            /**
             * Handle any errors from the API.
             *
             * @param error
             *
             * @returns void
             */
            handleError(error) {
                if (error.response.status === 422) {
                    this.handleValidationError(error);

                    return;
                }

                if (error.response.status === 401) {
                    alert('Invalid email address or password.');
                }
            },

            /**
             * Handle validation errors from the API.
             *
             * @param error
             */
            handleValidationError(error) {
                let errors = error.response.data.errors;
                let messages = [];

                for (let field in errors) {
                    if (!errors.hasOwnProperty(field)) {
                        return;
                    }

                    messages.push(errors[field].message);
                }

                alert(messages);
            }
        },
    };
</script>
