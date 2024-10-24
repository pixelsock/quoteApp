import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Load environment variables
dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Function to convert price strings to decimal
function priceToDecimal(priceStr) {
    return parseFloat(priceStr.replace('$', '').replace(',', ''))
}

// Load JSON data
const data = JSON.parse(fs.readFileSync('src/data/output.json', 'utf8'))

// Upload data to Supabase
async function uploadData() {
    for (const item of data) {
        const mirrorProduct = {
            product_line: item["Product Line"],
            mirror_style: item["Mirror Style"],
            light_direction: item["Light Direction"],
            size: item["Size"],
            color_temperature: item["Color Temperature"],
            mirror_controls: item["Mirror Controls"],
            accessories: item["Accessories"],
            frame_color: item["Frame Color"],
            mounting_orientation: item["Mounting Orientation"],
            light_output: item["Light Output"],
            dimming: item["Dimming"],
            base_distributor_price: priceToDecimal(item["Base Distributor Price"]),
            total_price: priceToDecimal(item["Total Price"]),
            sku: item["SKU"]
        }
        
        const { data, error } = await supabase
            .from("mirror_products")
            .insert(mirrorProduct)
        
        if (error) {
            console.error(`Error inserting item with SKU ${item['SKU']}:`, error)
        } else {
            console.log(`Inserted item with SKU: ${item['SKU']}`)
        }
    }
    console.log("Data upload complete!")
}

uploadData()
