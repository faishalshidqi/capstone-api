class ChallengesHandler {
	constructor(service) {
		this._service = service
	}

	async getChallengesHandler(request) {
		const {type} = request.query
		if (type == null) {
			const challenges = await this._service.getChallenges()
			console.log(challenges)
			return {
				status: 'success',
				data: {
					challenges
				}
			}
		}
		else {
			const challenges = await this._service.getChallengesByType(type)
			return {
				status: 'success',
				data: {
					challenges,
					type
				}
			}
		}
	}

	async getChallengeByIdHandler(request, h) {
		const { id } = request.params

		const challenge = await this._service.getChallengeById(id)

		const response = h.response({
			status: 'success',
			data: {
				challenge
			}
		})
		response.code(200)

		return response
	}
}

module.exports = ChallengesHandler
