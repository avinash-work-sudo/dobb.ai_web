import { GradientCard } from "@/components/ui/gradient-card"
import { Users } from "lucide-react"

export const Demo = () => {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Default Gradient Card</h2>
                <GradientCard />
            </div>
            
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Pricing Card Example</h2>
                <div className="max-w-sm mx-auto">
                    <GradientCard
                        variant="pricing"
                        title="Pro Plan"
                        description="For advanced teams"
                        features={[
                            "Everything in Starter",
                            "QA automation", 
                            "Self-healing tests",
                            "Knowledge transfer"
                        ]}
                        buttonText="Start Free Trial"
                        isPopular={true}
                        icon={<Users className="w-5 h-5" />}
                    />
                </div>
            </div>
        </div>
    )
}
