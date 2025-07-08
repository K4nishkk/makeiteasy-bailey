import { readAuthData, writeAuthData, removeAuthData } from "../config/mongodb.js";
import { initAuthCreds } from "@whiskeysockets/baileys/lib/Utils/auth-utils.js";
import protopkg, { AuthenticationCreds } from "@whiskeysockets/baileys";
const { proto } = protopkg

export async function useMongoAuthState(sessionId = 'default') {
	const credsId = `creds-${sessionId}`

	return {
		async state() {
			let creds: AuthenticationCreds = await readAuthData(credsId)
			if (!creds) {
				creds = initAuthCreds();
				await writeAuthData(credsId, creds);
			}

			return {
				creds,
				keys: {
					get: async (type: string, ids: string[]) => {
						const data: any = {}
						await Promise.all(
							ids.map(async id => {
								let value = await readAuthData(`${type}-${id}`)
								if (type === 'app-state-sync-key' && value) {
									value = proto.Message.AppStateSyncKeyData.fromObject(value)
								}

								data[id] = value
							})
						)
						return data
					},
					set: async (data: any) => {
						const tasks = []
						for (const category in data) {
							for (const id in data[category]) {
								const fieldId = `${category}-${id}`
								const value = data[category][id]
								tasks.push(value ? writeAuthData(fieldId, value) : removeAuthData(fieldId))
							}
						}
						await Promise.all(tasks)
					}
				}
			}
		},
		saveCreds: async (creds: AuthenticationCreds) => {
			await writeAuthData(credsId, creds)
		}
	}
}