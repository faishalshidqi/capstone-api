require('dotenv').config()

const Hapi = require('@hapi/hapi')

const courses = require('./api/courses/index')
const CoursesService = require('./services/postgres/CoursesService')
const challenges = require('./api/challenges')
const ChallengesService = require('./services/postgres/ChallengesService')
const ClientError = require('./exceptions/ClientError')

const course_managers = require('./api/course_managers/index')
const CourseManagersService = require('./services/postgres/CourseManagersService')
const CourseManagersValidator = require('./validator/course_managers')

const challenge_managers = require('./api/challenge_managers/index')
const ChallengeManagersService = require('./services/postgres/ChallengeManagersService')
const ChallengeManagersValidator = require('./validator/challenge_managers')

//const uploads = require('./api/uploads/index')
//const UploadsService = require('./services/uploads/UploadsService')

const init = async () => {
	const coursesService = new CoursesService()
	const challengesService = new ChallengesService()
	const courseManagersService = new CourseManagersService()
	const challengeManagersService = new ChallengeManagersService()

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
		routes : {
			cors: {
				origin: ['*']
			}
		}
	})

	await server.register([
		{
			plugin: courses,
			options: {
				service: coursesService
			},
		},
		{
			plugin: course_managers,
			options: {
				service: courseManagersService,
				validator: CourseManagersValidator
			}
		},
		{
			plugin: challenges,
			options: {
				service: challengesService
			}
		},
		{
			plugin: challenge_managers,
			options: {
				service: challengeManagersService,
				validator: ChallengeManagersValidator
			}
		}
	])

	server.ext('onPreResponse', (request, h) => {
		const { response } = request;
		if (response instanceof Error) {
			const {isServer, message, statusCode} = response;
			if (response instanceof ClientError) {
				const newResponse = h.response({
					status: 'fail',
					message: message,
				});
				newResponse.code(statusCode);
				return newResponse;
			}
			if (!isServer) {
				return h.continue;
			}
			const newResponse = h.response({
				status: 'error',
				message: 'terjadi kegagalan pada server kami',
			});
			newResponse.code(500);
			return newResponse;
		}
		return h.continue;
	});

	await server.start()
	// eslint-disable-next-line no-console
	console.log(`Server's running on ${server.info.uri}`)
}

void init()
