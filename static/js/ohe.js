/*globals angular */

(function () {
    angular.module('ohe', ['messages', 'channels', 'nav',
    function ($httpProvider) {
        var interceptor = ['$q', function ($q) {
            var success = function (response) {
                return response;
            };
            var error = function (response) {
                var status = response.status;
                if (status === 401) {
                    window.location.href = window.location.href;
                }
                return $q.reject(response);
            };
            return function (promise) {
                return promise.then(success, error);
            };
        }];
        $httpProvider.responseInterceptors.push(interceptor);
    }
    ]).config(function ($routeProvider, $locationProvider, $httpProvider) {
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix = '!';
        $routeProvider.otherwise({ redirectTo: '/' });
        $httpProvider.defaults.headers.common['X-CSRF-Token'] = document.getElementById('csrftoken').getAttribute('data-token');

        // jQuery ajax stuff for CSRF
        $(document).ajaxSend(function (event, xhr, settings) {
            function sameOrigin(url) {
                // url could be relative or scheme relative or absolute
                var host = document.location.host; // host + port
                var protocol = document.location.protocol;
                var sr_origin = '//' + host;
                var origin = protocol + sr_origin;
                // Allow absolute or scheme relative URLs to same origin
                return (url === origin || url.slice(0, origin.length + 1) === origin + '/') || (url === sr_origin || url.slice(0, sr_origin.length + 1) === sr_origin + '/') ||
                // or any other URL that isn't scheme relative or absolute i.e relative.
                !(/^(\/\/|http:|https:)/.test(url));
            }

            function safeMethod(method) {
                return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
            }

            if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
                xhr.setRequestHeader("X-CSRF-Token", document.getElementById('csrftoken').getAttribute('data-token'));
            }
        });

    }).run(function ($rootScope) {
        var user = document.getElementById('user');
        $rootScope.user_id = user && user.getAttribute('data-id');
        $rootScope.username = user && user.getAttribute('data-username');
        $rootScope.window = window;
        $rootScope.channel_list = [];
        $rootScope.$on('$routeChangeSuccess', function (event, route) {
            $rootScope.selectedNav = route.$route.selectedNav;
        });
        $rootScope.message_fetch_size = 50;
    });
})();
