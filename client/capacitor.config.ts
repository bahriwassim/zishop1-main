import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
	appId: 'co.zishop.app',
	appName: 'ZiShop',
	webDir: '../dist/public',
	server: {
		androidScheme: 'https',
		cleartext: true
	}
}

export default config


