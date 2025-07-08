import { readAuthData, writeAuthData, removeAuthData } from "../config/mongodb.js";
import { initAuthCreds } from "@whiskeysockets/baileys/lib/Utils/auth-utils.js";
import protopkg from "@whiskeysockets/baileys";
const { Message } = protopkg

import { configDotenv } from 'dotenv';
configDotenv();

export async function useMongoAuthState(sessionId = 'default') {
	const credsId = `creds-${sessionId}`

	return {
		async state() {
			let creds = await readAuthData(credsId)
			if (!creds) {
				creds = initAuthCreds();
				await writeAuthData(credsId, creds);
			}

			return {
				creds,
				keys: {
					get: async (type, ids) => {
						const data = {}
						await Promise.all(
							ids.map(async id => {
								let value = await readAuthData(`${type}-${id}`)
								if (type === 'app-state-sync-key' && value) {
									value = Message.AppStateSyncKeyData.fromObject(value)
								}

								data[id] = value
							})
						)
						return data
					},
					set: async (data) => {
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
		saveCreds: async (creds) => {
			await writeAuthData(credsId, creds)
		}
	}
}