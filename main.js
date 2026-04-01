import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';

await Actor.init();

const input = await Actor.getInput();

const {
    maxResults = 100,
        seniority = [],
            industryKeywords = [],
                contactEmailStatus = 'verified',
                } = input || {};

                const results = [];

                const crawler = new PuppeteerCrawler({
                    async requestHandler({ page, request, log }) {
                            log.info(`Processing: ${request.url}`);

                                    await page.waitForSelector('body');

                                            const leads = await page.evaluate(() => {
                                                        const items = [];
                                                                    document.querySelectorAll('.entity-result__item').forEach((el) => {
                                                                                    const name = el.querySelector('.entity-result__title-text')?.innerText?.trim() || '';
                                                                                                    const title = el.querySelector('.entity-result__primary-subtitle')?.innerText?.trim() || '';
                                                                                                                    const company = el.querySelector('.entity-result__secondary-subtitle')?.innerText?.trim() || '';
                                                                                                                                    if (name) items.push({ name, title, company });
                                                                                                                                                });
                                                                                                                                                            return items;
                                                                                                                                                                    });
                                                                                                                                                                    
                                                                                                                                                                            results.push(...leads);
                                                                                                                                                                                    log.info(`Found ${leads.length} leads on this page.`);
                                                                                                                                                                                        },
                                                                                                                                                                                            maxRequestsPerCrawl: Math.ceil(maxResults / 10),
                                                                                                                                                                                                headless: true,
                                                                                                                                                                                                });
                                                                                                                                                                                                
                                                                                                                                                                                                const searchQuery = industryKeywords.join(' OR ');
                                                                                                                                                                                                const seniorityFilter = seniority.join(',');
                                                                                                                                                                                                
                                                                                                                                                                                                const startUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}&titleFreeText=${encodeURIComponent(seniorityFilter)}`;
                                                                                                                                                                                                
                                                                                                                                                                                                await crawler.run([startUrl]);
                                                                                                                                                                                                
                                                                                                                                                                                                const trimmed = results.slice(0, maxResults);
                                                                                                                                                                                                
                                                                                                                                                                                                await Actor.pushData(trimmed);
                                                                                                                                                                                                
                                                                                                                                                                                                console.log(`Saved ${trimmed.length} leads. Email filter: ${contactEmailStatus}`);
                                                                                                                                                                                                
                                                                                                                                                                                                await Actor.exit();
