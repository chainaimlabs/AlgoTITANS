import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { AtomicMarketplaceV3Factory } from '../artifacts/atomic_marketplace_v3/AtomicMarketplaceV3Client'

export async function deploy() {
  console.log('====================================')
  console.log('🚀 Deploying Atomic Marketplace V3...')
  console.log('====================================')

  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  try {
    // Use the same Factory pattern as working contracts
    const factory = algorand.client.getTypedAppFactory(AtomicMarketplaceV3Factory, {
      defaultSender: deployer.addr,
    })

    const { appClient, result } = await factory.deploy({ 
      onUpdate: 'append', 
      onSchemaBreak: 'append' 
    })

    // If app was just created, fund the app account
    if (['create', 'replace'].includes(result.operationPerformed)) {
      await algorand.send.payment({
        amount: (1).algo(),
        sender: deployer.addr,
        receiver: appClient.appAddress,
      })
    }

    console.log(`✅ AtomicMarketplaceV3 deployed successfully!`)
    console.log(`📍 App ID: ${appClient.appClient.appId}`)
    console.log(`📍 App Address: ${appClient.appAddress}`)

    return {
      appId: appClient.appClient.appId,
      appAddress: appClient.appAddress,
      operationPerformed: result.operationPerformed
    }

  } catch (error) {
    console.error('Error deploying AtomicMarketplaceV3:', error.message)
    throw error
  }
}
