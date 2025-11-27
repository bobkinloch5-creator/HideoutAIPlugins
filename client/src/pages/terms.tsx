import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TermsOfService() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[70vh] pr-4">
                        <div className="space-y-6 text-muted-foreground">
                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
                                <p>
                                    By accessing and using Hideout Bot AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">2. Description of Service</h2>
                                <p>
                                    Hideout Bot AI provides AI-powered game generation tools for Roblox developers. We reserve the right to modify, suspend, or discontinue the Service at any time.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">3. User Accounts</h2>
                                <p>
                                    You are responsible for maintaining the security of your account and password. You agree to accept responsibility for all activities that occur under your account.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">4. User Content</h2>
                                <p>
                                    You retain ownership of the content you generate using our Service. However, you grant us a license to use, store, and display your content as necessary to provide the Service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">5. Prohibited Uses</h2>
                                <p>
                                    You agree not to use the Service for any illegal or unauthorized purpose, including but not limited to generating harmful, offensive, or infringing content.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">6. Disclaimer of Warranties</h2>
                                <p>
                                    The Service is provided "as is" and "as available" without any warranties of any kind, express or implied.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
                                <p>
                                    In no event shall Hideout Bot AI be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">8. Changes to Terms</h2>
                                <p>
                                    We may update these Terms of Service from time to time. We will notify you of any changes by posting the new Terms on this page.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">9. Contact Us</h2>
                                <p>
                                    If you have any questions about these Terms, please contact us via our Discord community.
                                </p>
                            </section>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
