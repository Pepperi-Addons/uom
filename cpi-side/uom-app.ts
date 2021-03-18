import '@pepperi-addons/cpi-node'

export async function load(configuration: any) {
    console.log('inside load of uom module cpi side file\n before subscribing to interceptor');
    pepperi.events.on('TSAButton')?.use(async (data, next, main) => {
        let block = await confirm('this will run before relevant program. continue?') 

        await next(block ? null : main);

        await alert('program had finished running.')
    });
}