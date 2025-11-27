import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[70vh] pr-4">
                        <div className="space-y-6 text-muted-foreground">
                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">1. Information We Collect</h2>
                                <p>
                                    We collect information you provide directly to us, such as when you create an account, use our AI generation tools, or communicate with us. This may include your username, email address, and generated content.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
                                <p>
                                    We use the information we collect to provide, maintain, and improve our Service, to communicate with you, and to personalize your experience.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">3. Data Storage</h2>
                                <p>
                                    Your data is stored securely on our servers and third-party cloud providers (e.g., Supabase). We implement appropriate security measures to protect your information.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">4. Third-Party Services</h2>
                                <p>
                                    We may use third-party services (such as Google Gemini API, Discord, PayPal) that collect, monitor, and analyze information. These third parties have their own privacy policies addressing how they use such information.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">5. Cookies</h2>
                                <p>
                                    We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">6. Children's Privacy</h2>
                                <p>
                                    Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">7. Changes to This Privacy Policy</h2>
                                <p>
                                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold text-foreground mb-2">8. Contact Us</h2>
                                <p>
                                    If you have any questions about this Privacy Policy, please contact us via our Discord community.
                                </p>
                            </section>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
